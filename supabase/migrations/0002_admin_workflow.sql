-- Manufacturing OS — 0002: owner admin workflow (Supabase variant)
--
-- Counterpart of infra/sql/0002_admin_workflow_rds.sql — identical tables
-- and columns. Instead of role grants, every new table gets RLS enabled
-- with NO anon/authenticated policies, so only the service role used by
-- lib/rfq/store/supabase.ts and lib/content/overrides/supabase.ts (server
-- only) can read or write — same model as 0001.
--
-- Apply with `supabase db push` or the SQL editor (see DEPLOYMENT.md,
-- legacy path). Idempotent: safe to re-run.

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

create table if not exists rfq_status_history (
  id uuid primary key default gen_random_uuid(),
  rfq_submission_id uuid not null references rfq_submissions (id) on delete cascade,
  from_status text,
  to_status text not null,
  changed_by text not null default 'owner',
  changed_at timestamptz not null default now()
);

create index if not exists rfq_status_history_submission_idx on rfq_status_history (rfq_submission_id, changed_at);

create table if not exists rfq_notes (
  id uuid primary key default gen_random_uuid(),
  rfq_submission_id uuid not null references rfq_submissions (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 8000),
  author text not null default 'owner',
  created_at timestamptz not null default now()
);

create index if not exists rfq_notes_submission_idx on rfq_notes (rfq_submission_id, created_at);

create table if not exists content_overrides (
  path text primary key check (path like '/%'),
  paused boolean not null default true,
  reason text not null default '',
  updated_by text not null default 'owner',
  updated_at timestamptz not null default now()
);

alter table rfq_status_history enable row level security;
alter table rfq_notes enable row level security;
alter table content_overrides enable row level security;

-- Intentionally no policies for anon/authenticated on any of the three
-- tables: default-deny for everything except the server-only service role.
