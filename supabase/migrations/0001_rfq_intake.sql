-- Manufacturing OS — RFQ intake schema
--
-- Run against a real Supabase project (see DEPLOYMENT.md for how to
-- create one and how to apply this file — `supabase db push` or the SQL
-- editor). Nothing in this repo runs this automatically; the app's server
-- code (lib/rfq/store/supabase.ts) assumes it has already been applied.
--
-- Security model (AGENTS.md: CAD/customer files must never be publicly
-- indexed or exposed):
--   * RLS is enabled on both tables with NO policies granted to `anon` or
--     `authenticated` — only the service role (which bypasses RLS
--     entirely, per Supabase's design) can read or write. The app's
--     server-only Supabase client (lib/rfq/store/supabase.ts) is the only
--     code path that uses the service role key.
--   * The `rfq-files` Storage bucket is created with `public = false` and
--     no anon/authenticated storage policies are granted, so files are
--     never reachable by a public URL — only via a short-lived signed URL
--     the server explicitly issues (see RfqStore.getFileDownloadRef),
--     which this migration does not need to grant any extra policy for
--     because the service role already bypasses bucket RLS too.

create extension if not exists "pgcrypto";

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
  storage_path text not null,
  created_at timestamptz not null default now()
);

create index if not exists rfq_files_submission_idx on rfq_files (rfq_submission_id);

alter table rfq_submissions enable row level security;
alter table rfq_files enable row level security;

-- Intentionally no policies are created for anon/authenticated roles on
-- either table: with RLS enabled and zero policies, every non-service-role
-- request is denied by default. Only the service role (bypasses RLS) can
-- read or write, which matches "customer files/RFQ data are private by
-- default."

-- Private storage bucket for uploaded CAD/drawing/BOM files.
insert into storage.buckets (id, name, public)
values ('rfq-files', 'rfq-files', false)
on conflict (id) do update set public = false;

-- No storage.objects policies are added for anon/authenticated on this
-- bucket, so (per Supabase Storage's default-deny RLS on storage.objects)
-- no public/anon read, write, or list access exists. The service role
-- (used only by lib/rfq/store/supabase.ts) bypasses this and is the only
-- writer/reader; downloads outside the server happen only via a
-- short-lived signed URL the server explicitly creates.

-- Keep updated_at current on submission edits (e.g. a future reviewer
-- status change).
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
