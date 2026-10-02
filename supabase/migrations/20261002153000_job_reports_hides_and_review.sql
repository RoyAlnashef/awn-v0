-- =============================================================================
-- Migration: job_reports_hides_and_review
--
-- IMPORTANT: Run this manually in the Supabase SQL Editor.
-- Agents must NEVER execute this against the project (no db push, no MCP SQL).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Job reports (admin triage)
-- ---------------------------------------------------------------------------

create table if not exists public.job_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  job_id uuid not null references public.job_postings (id) on delete cascade,
  reason text not null,
  dismissed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint job_reports_reason_check check (
    reason in (
      'harassment',
      'spam',
      'fake_or_misleading',
      'privacy_violation',
      'inappropriate_content',
      'job_posting_issue',
      'impersonation',
      'safety_concern',
      'other'
    )
  )
);

create unique index if not exists job_reports_one_open_per_reporter_job_idx
  on public.job_reports (reporter_id, job_id)
  where dismissed_at is null;

create index if not exists job_reports_created_at_idx
  on public.job_reports (created_at desc);

create index if not exists job_reports_job_id_idx
  on public.job_reports (job_id);

comment on table public.job_reports is
  'Member-submitted job reports for admin review.';

alter table public.job_reports enable row level security;

create policy "job_reports_insert_self"
  on public.job_reports
  for insert
  to authenticated
  with check (reporter_id = auth.uid());

create policy "job_reports_select_own"
  on public.job_reports
  for select
  to authenticated
  using (reporter_id = auth.uid());

create policy "job_reports_select_admin"
  on public.job_reports
  for select
  to authenticated
  using (public.is_admin());

create policy "job_reports_update_admin"
  on public.job_reports
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Per-member hide from job board (not poster is_hidden)
-- ---------------------------------------------------------------------------

create table if not exists public.job_board_hides (
  user_id uuid not null references public.profiles (id) on delete cascade,
  job_id uuid not null references public.job_postings (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, job_id)
);

create index if not exists job_board_hides_user_id_idx
  on public.job_board_hides (user_id);

comment on table public.job_board_hides is
  'Jobs hidden from the member job board by the viewing user.';

alter table public.job_board_hides enable row level security;

create policy "job_board_hides_select_own"
  on public.job_board_hides
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "job_board_hides_insert_own"
  on public.job_board_hides
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "job_board_hides_delete_own"
  on public.job_board_hides
  for delete
  to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Admin Under Review lock on job postings
-- ---------------------------------------------------------------------------

alter table public.job_postings
  add column if not exists under_review_at timestamptz,
  add column if not exists status_before_review public.job_status,
  add column if not exists under_review_by uuid references public.profiles (id) on delete set null,
  add column if not exists under_review_report_id uuid references public.job_reports (id) on delete set null;

create index if not exists job_postings_under_review_at_idx
  on public.job_postings (under_review_at)
  where under_review_at is not null;

comment on column public.job_postings.under_review_at is
  'When set, poster cannot mutate the job until an admin releases or closes review.';
