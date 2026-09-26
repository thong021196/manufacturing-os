import { Pool, type PoolConfig } from "pg";

/**
 * One shared Postgres pool per server process, used by every AWS-backend
 * module (lib/rfq/store/aws.ts, lib/content/overrides/aws.ts) so the app
 * holds a single small set of connections to RDS instead of one pool per
 * module.
 *
 * DATABASE_URL is the least-privilege `manufacturing_os_app` connection
 * string injected by ECS from Secrets Manager (infra/terraform/ecs.tf).
 * The RDS master credentials are never visible to the app -- only the
 * one-off migration task (scripts/migrate.mjs) receives those.
 */
let pool: Pool | null = null;

export function pgSslConfig(): PoolConfig["ssl"] {
  // RDS requires TLS. "relaxed" (default) encrypts but does not validate
  // the server certificate against Amazon's RDS CA bundle -- acceptable for
  // MVP because the connection never leaves the private VPC subnets. Set
  // AWS_DB_SSL=strict once the RDS CA bundle is wired into the image, or
  // "off" for a local Postgres without TLS (tests / local development).
  const sslMode = process.env.AWS_DB_SSL || "relaxed";
  return sslMode === "off" ? false : { rejectUnauthorized: sslMode === "strict" };
}

export function getPgPool(): Pool {
  if (pool) return pool;
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set (RDS Postgres connection string). Set RFQ_BACKEND=local to use the dev/test fallback instead.",
    );
  }
  pool = new Pool({
    connectionString,
    ssl: pgSslConfig(),
    max: Number(process.env.PG_POOL_MAX) > 0 ? Number(process.env.PG_POOL_MAX) : 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });
  pool.on("error", (error) => {
    // An idle client erroring (e.g. RDS maintenance restart) must not crash
    // the Node process; the pool replaces the client on next checkout.
    console.error("[db] idle Postgres client error", error.message);
  });
  return pool;
}

export function toIso(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  return value == null ? "" : String(value);
}
