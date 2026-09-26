-- Manufacturing OS — 0002: owner admin workflow (plain Postgres / AWS RDS)
--
-- Counterpart of supabase/migrations/0002_admin_workflow.sql (same tables
-- and columns; this variant adds grants for the least-privilege app role
-- instead of Supabase RLS).
--
-- Adds what the single-owner /admin needs:
--   * the RFQ review workflow  new -> reviewing -> quoted -> won | lost | archived
--     (existing rows: received -> new, under_review -> reviewing)
--   * rfq_status_history — append-only log of every status change
--     (outcome data per AGENTS.md rule 9; nothing is overwritten silently)
--   * rfq_notes — append-only internal owner notes with timestamps
--   * content_overrides — the owner's small "pause this public page" switch
--     for the content calendar (docs/ops/content-pipeline.md). Page bodies
--     and schedules stay in the repo; this table can only hide a page.
--
-- Applied automatically by scripts/migrate.mjs (one-off ECS task run by the
-- deploy workflow). Idempotent: safe to re-run.

-- --- RFQ status workflow ----------------------------------------------------

alter table rfq_submissions drop constraint if exists rfq_submissions_status_check;

update rfq_submissions set status = 'new' where status = 'received';
update rfq_submissions set status = 'reviewing' where status = 'under_review';

alter table rfq_submissions alter column status set default 'new';
alter table rfq_submissions
  add constraint rfq_submissions_status_check
  check (status in ('new', 'reviewing', 'quoted', 'won', 'lost', 'archived', 'spam_flagged'));

alter table rfq_submissions add column if not exists status_changed_at timestamptz;
update rfq_submissions set status_changed_at = coalesce(status_changed_at, updated_at, created_at);
alter table rfq_submissions alter column status_changed_at set default now();
alter table rfq_submissions alter column status_changed_at set not null;

create index if not exists rfq_submissions_status_idx on rfq_submissions (status, created_at desc);

-- --- Status history (append-only) -----------------------------------------

create table if not exists rfq_status_history (
  id uuid primary key default gen_random_uuid(),
  rfq_submission_id uuid not null references rfq_submissions (id) on delete cascade,
  from_status text,
  to_status text not null,
  changed_by text not null default 'owner',
  changed_at timestamptz not null default now()
);

create index if not exists rfq_status_history_submission_idx on rfq_status_history (rfq_submission_id, changed_at);

-- --- Internal notes (append-only) ------------------------------------------

create table if not exists rfq_notes (
  id uuid primary key default gen_random_uuid(),
  rfq_submission_id uuid not null references rfq_submissions (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 8000),
  author text not null default 'owner',
  created_at timestamptz not null default now()
);

create index if not exists rfq_notes_submission_idx on rfq_notes (rfq_submission_id, created_at);

-- --- Content calendar override ---------------------------------------------

create table if not exists content_overrides (
  path text primary key check (path like '/%'),
  paused boolean not null default true,
  reason text not null default '',
  updated_by text not null default 'owner',
  updated_at timestamptz not null default now()
);

-- --- Least-privilege grants for the app role --------------------------------
-- The app may read and append history/notes but never rewrite or delete
-- them (no UPDATE/DELETE on either table). It may add/remove page pauses.

grant select, insert on rfq_status_history to manufacturing_os_app;
grant select, insert on rfq_notes to manufacturing_os_app;
grant select, insert, update, delete on content_overrides to manufacturing_os_app;
