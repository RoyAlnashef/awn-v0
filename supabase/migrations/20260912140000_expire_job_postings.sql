-- Migration: expire_job_postings
-- Auto-expire open jobs past their apply window; extend RLS for applicant/saved read access.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.is_job_applicant(job uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.job_applications ja
    where ja.job_id = job
      and ja.applicant_id = auth.uid()
      and ja.status <> 'withdrawn'
  );
$$;

revoke all on function public.is_job_applicant(uuid) from public;
grant execute on function public.is_job_applicant(uuid) to authenticated;

create or replace function public.has_saved_job(job uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.saved_jobs sj
    where sj.job_id = job
      and sj.user_id = auth.uid()
  );
$$;

revoke all on function public.has_saved_job(uuid) from public;
grant execute on function public.has_saved_job(uuid) to authenticated;

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
      and (
        (j.kind = 'full'::public.job_kind and coalesce(j.deadline, j.end_date) >= current_date)
        or (j.kind = 'urgent'::public.job_kind and j.expires_at is not null and j.expires_at > now())
      )
  );
$$;

revoke all on function public.is_job_open(uuid) from public;
grant execute on function public.is_job_open(uuid) to authenticated;

create or replace function public.expire_stale_job_postings()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.job_postings
  set
    status = 'expired'::public.job_status,
    updated_at = now()
  where status = 'open'::public.job_status
    and (
      (
        kind = 'full'::public.job_kind
        and coalesce(deadline, end_date) < current_date
      )
      or (
        kind = 'urgent'::public.job_kind
        and expires_at is not null
        and expires_at <= now()
      )
    );
end;
$$;

revoke all on function public.expire_stale_job_postings() from public;
grant execute on function public.expire_stale_job_postings() to authenticated;

-- ---------------------------------------------------------------------------
-- RLS: allow applicants/savers to read expired and filled jobs
-- ---------------------------------------------------------------------------

drop policy if exists "job_postings_select_open" on public.job_postings;
create policy "job_postings_select_open"
  on public.job_postings
  for select
  to authenticated
  using (
    public.is_admin()
    or poster_id = auth.uid()
    or status = 'open'::public.job_status
    or (
      status in ('expired'::public.job_status, 'filled'::public.job_status)
      and (
        public.is_job_applicant(id)
        or public.has_saved_job(id)
      )
    )
  );
