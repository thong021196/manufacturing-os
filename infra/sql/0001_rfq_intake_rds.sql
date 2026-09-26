-- Manufacturing OS — RFQ intake schema (plain Postgres / AWS RDS variant)
--
-- This is the AWS-production counterpart of
-- supabase/migrations/0001_rfq_intake.sql. Table shape is identical (kept
-- identical on purpose so lib/rfq/store/aws.ts and lib/rfq/store/supabase.ts
-- can share the same mental model and, if ever needed, the same data could
-- be migrated between the two with a straight COPY). What's different:
--
--   * No `storage.buckets` / Supabase Storage bootstrap — this schema is
--     ONLY the Postgres side. File bytes live in the private
--     manufacturing-os-rfq-files-* S3 bucket (see infra/terraform/s3.tf),
--     not in this database.
--   * No Supabase Row Level Security — RDS has no anon/authenticated
--     Supabase roles to restrict. Access control instead comes from: (a)
--     this database being in a private subnet with a security group that
--     only allows inbound from the ECS task security group (see
--     infra/terraform/security_groups.tf), and (b) the app connecting with
--     a single application role/credential that only this backend uses —
--     there is no public-internet path to this database at all.
--   * A dedicated, least-privilege `manufacturing_os_app` role is created
--     for the application to connect as, instead of using the RDS master
--     user for runtime traffic.
--
-- How to apply: automatically. The production deploy workflow
-- (.github/workflows/deploy-production-aws.yml) runs `node
-- scripts/migrate.mjs` as a one-off ECS task (task definition
-- manufacturing-os-migrate, infra/terraform/ecs.tf) before every service
-- rollout. The runner applies every infra/sql/NNNN_*.sql file not yet
-- recorded in the `schema_migrations` table, each in its own transaction,
-- under a Postgres advisory lock. See docs/ops/LAUNCH-RUNBOOK.md.

create extension if not exists "pgcrypto";

-- Dedicated application role `manufacturing_os_app`. The master (admin)
-- credentials created by Terraform (infra/terraform/rds.tf) are used only
-- by the one-off migration task; the running app connects as
-- manufacturing_os_app using a separate password stored in its own Secrets
-- Manager entry (infra/terraform/secrets.tf). Keeps the blast radius of the
-- app's runtime credential to exactly the tables granted below and in
-- later migrations.
--
-- The role itself is created (and its password kept in sync with Secrets
-- Manager) by scripts/migrate.mjs BEFORE this file runs, using the
-- DB_APP_PASSWORD the migration task receives from Secrets Manager. It is
-- not created here because a password cannot be passed into plain SQL
-- without either committing it or relying on psql-only variable syntax
-- (an earlier draft of this file used `:'app_password'` inside a DO block,
-- which psql does not interpolate inside dollar-quoted strings).

create table if not exists rfq_submissions (
  id uuid primary key default gen_random_uuid(),
  reference_id text not null unique,
  status text not null default 'received'
    check (status in ('received', 'under_review', 'spam_flagged')),

  part_name text not null default '',
  context text not null default '',
  revision text not null default '',
  quantity text not null default '',
  target_date date,
  part_function text not null default '',
  material text not null default '',
  finish text not null default '',
  requirements text not null default '',

  contact_email text not null,
  contact_company text not null default '',
  contact_note text not null default '',

  source_page_path text not null default '/rfq',
  source_ip_hash text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists rfq_submissions_created_at_idx on rfq_submissions (created_at desc);
create index if not exists rfq_submissions_contact_email_idx on rfq_submissions (contact_email);

create table if not exists rfq_files (
  id uuid primary key default gen_random_uuid(),
  rfq_submission_id uuid not null references rfq_submissions (id) on delete cascade,
  file_name text not null,
  content_type text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  -- S3 object key inside the private manufacturing-os-rfq-files-* bucket,
  -- e.g. "<reference_id>/<file_id>-<safe_name>". Never a public URL — see
  -- lib/rfq/store/aws.ts.
  storage_path text not null,
  created_at timestamptz not null default now()
);

create index if not exists rfq_files_submission_idx on rfq_files (rfq_submission_id);

-- Least-privilege grants: the app role can read/write rows in exactly
-- these two tables and use the sequence/extension defaults it needs, and
-- nothing else in the database (no DDL, no other schemas).
grant usage on schema public to manufacturing_os_app;
grant select, insert, update on rfq_submissions to manufacturing_os_app;
grant select, insert on rfq_files to manufacturing_os_app;

create or replace function set_rfq_submissions_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists rfq_submissions_set_updated_at on rfq_submissions;
create trigger rfq_submissions_set_updated_at
  before update on rfq_submissions
  for each row execute function set_rfq_submissions_updated_at();
