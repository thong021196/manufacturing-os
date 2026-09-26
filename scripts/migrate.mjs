#!/usr/bin/env node
// Manufacturing OS — idempotent Postgres migration runner (AWS RDS path).
//
// Usage:
//   npm run migrate                      # locally, against MIGRATION_DATABASE_URL
//   node scripts/migrate.mjs             # inside the production image (ECS one-off task)
//   node scripts/migrate.mjs --dry-run   # list pending migrations, apply nothing
//
// What it does, in order:
//   1. Connects with MIGRATION_DATABASE_URL (the RDS *master* credentials;
//      falls back to DATABASE_URL for local use). In production this is only
//      ever injected into the one-off `manufacturing-os-migrate` ECS task
//      (infra/terraform/ecs.tf) — the long-running app task never sees it.
//   2. Takes a Postgres advisory lock so two deploys can never migrate at
//      the same time.
//   3. If DB_APP_PASSWORD is set: creates the least-privilege
//      `manufacturing_os_app` login role if missing, and (re)sets its
//      password so it always matches Secrets Manager.
//   4. Creates `schema_migrations` if missing, then applies every
//      `NNNN_*.sql` file in MIGRATIONS_DIR (default infra/sql) that is not
//      recorded there yet — each file in its own transaction, recorded with a
//      sha256 checksum. Already-applied files are skipped; if an applied
//      file's checksum changed, a warning is printed (never re-applied).
//
// Exit code 0 = database is at the latest migration. Anything else = the
// deploy workflow stops before touching the running service.

import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const APP_ROLE = "manufacturing_os_app";
const LOCK_KEY = 4242_0002; // arbitrary, constant advisory-lock key for this app

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..");
const migrationsDir = path.resolve(repoRoot, process.env.MIGRATIONS_DIR || "infra/sql");
const dryRun = process.argv.includes("--dry-run");

function log(message) {
  console.log(`[migrate] ${message}`);
}

function sslConfig() {
  const mode = process.env.AWS_DB_SSL || "relaxed";
  return mode === "off" ? false : { rejectUnauthorized: mode === "strict" };
}

async function listMigrationFiles() {
  const entries = await readdir(migrationsDir);
  return entries.filter((name) => /^\d{4}_[a-z0-9_]+\.sql$/i.test(name)).sort();
}

async function ensureAppRole(client) {
  const password = process.env.DB_APP_PASSWORD;
  if (!password) {
    log(`DB_APP_PASSWORD not set — skipping ${APP_ROLE} role create/password sync.`);
    return;
  }
  const quotedPassword = client.escapeLiteral(password);
  const { rowCount } = await client.query("select 1 from pg_roles where rolname = $1", [APP_ROLE]);
  if (rowCount === 0) {
    if (dryRun) return log(`would create role ${APP_ROLE}`);
    await client.query(`create role ${APP_ROLE} with login password ${quotedPassword}`);
    log(`created role ${APP_ROLE}`);
  } else {
    if (dryRun) return log(`would sync password for role ${APP_ROLE}`);
    await client.query(`alter role ${APP_ROLE} with login password ${quotedPassword}`);
    log(`role ${APP_ROLE} exists — password synced with Secrets Manager`);
  }
}

async function main() {
  const connectionString = process.env.MIGRATION_DATABASE_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("[migrate] MIGRATION_DATABASE_URL (or DATABASE_URL) is required.");
    process.exit(2);
  }

  const client = new pg.Client({ connectionString, ssl: sslConfig(), connectionTimeoutMillis: 15_000 });
  await client.connect();
  log(`connected; migrations dir: ${path.relative(repoRoot, migrationsDir) || "."}${dryRun ? " (dry run)" : ""}`);

  try {
    await client.query("select pg_advisory_lock($1)", [LOCK_KEY]);

    await ensureAppRole(client);

    await client.query(`
      create table if not exists schema_migrations (
        version text primary key,
        checksum text not null,
        applied_at timestamptz not null default now()
      )`);

    const { rows } = await client.query("select version, checksum from schema_migrations");
    const applied = new Map(rows.map((r) => [r.version, r.checksum]));

    const files = await listMigrationFiles();
    let appliedNow = 0;
    for (const file of files) {
      const sql = await readFile(path.join(migrationsDir, file), "utf-8");
      const checksum = createHash("sha256").update(sql).digest("hex");
      const version = file.replace(/\.sql$/i, "");

      if (applied.has(version)) {
        if (applied.get(version) !== checksum) {
          console.warn(
            `[migrate] WARNING: ${file} changed after it was applied (checksum mismatch). ` +
              "It will NOT be re-applied — put schema changes in a new NNNN_*.sql file instead.",
          );
        }
        continue;
      }

      if (dryRun) {
        log(`pending: ${file}`);
        continue;
      }

      log(`applying ${file} ...`);
      await client.query("begin");
      try {
        await client.query(sql);
        await client.query("insert into schema_migrations (version, checksum) values ($1, $2)", [version, checksum]);
        await client.query("commit");
      } catch (error) {
        await client.query("rollback");
        throw new Error(`${file} failed and was rolled back: ${error.message}`);
      }
      appliedNow += 1;
      log(`applied ${file}`);
    }

    log(dryRun ? "dry run complete." : `done — ${appliedNow} applied, ${files.length - appliedNow} already up to date.`);
  } finally {
    await client.query("select pg_advisory_unlock($1)", [LOCK_KEY]).catch(() => {});
    await client.end();
  }
}

main().catch((error) => {
  console.error(`[migrate] FAILED: ${error.message}`);
  process.exit(1);
});
