-- =============================================================================
-- Migration: create_jobs_tables
--
-- IMPORTANT: Run this manually in the Supabase SQL Editor.
-- Agents must NEVER execute this against the project (no db push, no MCP SQL).
-- Paste the full contents of this file into the Dashboard → SQL Editor → Run.
--
-- Safe to re-run: skips objects that already exist.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

do $do$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'job_kind'
      and n.nspname = 'public'
  ) then
    create type public.job_kind as enum ('full', 'urgent');
  end if;
end
$do$;

do $do$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'job_status'
      and n.nspname = 'public'
  ) then
    create type public.job_status as enum ('open', 'filled', 'expired', 'deleted');
  end if;
end
$do$;

do $do$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'engagement_type'
      and n.nspname = 'public'
  ) then
    create type public.engagement_type as enum (
      'Touring',
      'Festival',
      'One-Off',
      'Session',
      'Residency'
    );
  end if;
end
$do$;

do $do$
begin
  if not exists (
    select 1
    from pg_type t
    join pg_namespace n on n.oid = t.typnamespace
    where t.typname = 'application_status'
      and n.nspname = 'public'
  ) then
    create type public.application_status as enum (
      'pending',
      'approved',
      'maybe',
      'declined',
      'withdrawn'
    );
  end if;
end
$do$;

-- ---------------------------------------------------------------------------
-- Job postings
-- ---------------------------------------------------------------------------

create table if not exists public.job_postings (
  id uuid primary key default gen_random_uuid(),
  kind public.job_kind not null default 'full',
  status public.job_status not null default 'open',
  poster_id uuid not null references public.profiles (id) on delete cascade,
  role text not null check (char_length(trim(role)) > 0),
  department text not null,
  production text not null default '',
  location text not null default '',
  pay_rate text not null default '',
  start_date date not null,
  end_date date not null,
  deadline date,
  engagement public.engagement_type not null default 'Touring',
  details text not null default '',
  expires_at timestamptz,
  filled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint job_postings_end_after_start check (end_date >= start_date)
);

create index if not exists job_postings_status_idx on public.job_postings (status);
create index if not exists job_postings_kind_idx on public.job_postings (kind);
create index if not exists job_postings_poster_id_idx on public.job_postings (poster_id);
create index if not exists job_postings_department_idx on public.job_postings (department);
create index if not exists job_postings_engagement_idx on public.job_postings (engagement);
create index if not exists job_postings_start_date_idx on public.job_postings (start_date);
create index if not exists job_postings_created_at_idx on public.job_postings (created_at desc);
create index if not exists job_postings_expires_at_idx on public.job_postings (expires_at)
  where expires_at is not null;

comment on table public.job_postings is
  'Open roles and urgent Help Now-style callouts posted by network members.';

-- ---------------------------------------------------------------------------
-- Job applications
-- ---------------------------------------------------------------------------

create table if not exists public.job_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.job_postings (id) on delete cascade,
  applicant_id uuid not null references public.profiles (id) on delete cascade,
  note text not null default '',
  status public.application_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_id, applicant_id)
);

create index if not exists job_applications_job_id_idx on public.job_applications (job_id);
create index if not exists job_applications_applicant_id_idx on public.job_applications (applicant_id);
create index if not exists job_applications_status_idx on public.job_applications (status);

comment on table public.job_applications is
  'Crew applications to job postings with optional note and review status.';

-- ---------------------------------------------------------------------------
-- Saved jobs
-- ---------------------------------------------------------------------------

create table if not exists public.saved_jobs (
  job_id uuid not null references public.job_postings (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (job_id, user_id)
);

create index if not exists saved_jobs_user_id_idx on public.saved_jobs (user_id);

comment on table public.saved_jobs is
  'Bookmarked job postings per member.';

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

create or replace function public.set_job_postings_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists job_postings_set_updated_at on public.job_postings;
create trigger job_postings_set_updated_at
  before update on public.job_postings
  for each row
  execute function public.set_job_postings_updated_at();

create or replace function public.set_job_applications_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists job_applications_set_updated_at on public.job_applications;
create trigger job_applications_set_updated_at
  before update on public.job_applications
  for each row
  execute function public.set_job_applications_updated_at();

-- ---------------------------------------------------------------------------
-- RLS helpers
-- ---------------------------------------------------------------------------

create or replace function public.is_job_poster(job uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.job_postings j
    where j.id = job
      and j.poster_id = auth.uid()
  );
$$;

revoke all on function public.is_job_poster(uuid) from public;
grant execute on function public.is_job_poster(uuid) to authenticated;

create or replace function public.is_job_open(job uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.job_postings j
    where j.id = job
      and j.status = 'open'::public.job_status
      and (j.expires_at is null or j.expires_at > now())
      and (j.deadline is null or j.deadline >= current_date)
  );
$$;

revoke all on function public.is_job_open(uuid) from public;
grant execute on function public.is_job_open(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.job_postings enable row level security;
alter table public.job_applications enable row level security;
alter table public.saved_jobs enable row level security;

drop policy if exists "job_postings_select_open" on public.job_postings;
create policy "job_postings_select_open"
  on public.job_postings
  for select
  to authenticated
  using (
    public.is_admin()
    or poster_id = auth.uid()
    or (
      status = 'open'::public.job_status
      and (expires_at is null or expires_at > now())
      and (deadline is null or deadline >= current_date)
    )
  );

drop policy if exists "job_postings_insert_own" on public.job_postings;
create policy "job_postings_insert_own"
  on public.job_postings
  for insert
  to authenticated
  with check (poster_id = auth.uid());

drop policy if exists "job_postings_update_own_or_admin" on public.job_postings;
create policy "job_postings_update_own_or_admin"
  on public.job_postings
  for update
  to authenticated
  using (poster_id = auth.uid() or public.is_admin())
  with check (poster_id = auth.uid() or public.is_admin());

drop policy if exists "job_applications_select" on public.job_applications;
create policy "job_applications_select"
  on public.job_applications
  for select
  to authenticated
  using (
    public.is_admin()
    or applicant_id = auth.uid()
    or public.is_job_poster(job_id)
  );

drop policy if exists "job_applications_insert" on public.job_applications;
create policy "job_applications_insert"
  on public.job_applications
  for insert
  to authenticated
  with check (
    applicant_id = auth.uid()
    and public.is_job_open(job_id)
    and not public.is_job_poster(job_id)
  );

drop policy if exists "job_applications_update" on public.job_applications;
create policy "job_applications_update"
  on public.job_applications
  for update
  to authenticated
  using (
    public.is_admin()
    or applicant_id = auth.uid()
    or public.is_job_poster(job_id)
  )
  with check (
    public.is_admin()
    or applicant_id = auth.uid()
    or public.is_job_poster(job_id)
  );

drop policy if exists "job_applications_delete_own" on public.job_applications;
create policy "job_applications_delete_own"
  on public.job_applications
  for delete
  to authenticated
  using (applicant_id = auth.uid() or public.is_admin());

drop policy if exists "saved_jobs_select_own" on public.saved_jobs;
create policy "saved_jobs_select_own"
  on public.saved_jobs
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "saved_jobs_insert_own" on public.saved_jobs;
create policy "saved_jobs_insert_own"
  on public.saved_jobs
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "saved_jobs_delete_own" on public.saved_jobs;
create policy "saved_jobs_delete_own"
  on public.saved_jobs
  for delete
  to authenticated
  using (user_id = auth.uid());

-- =============================================================================
