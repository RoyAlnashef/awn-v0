-- =============================================================================
-- Migration: tour_credits_v2
--
-- IMPORTANT: Run this manually in the Supabase SQL Editor.
-- Agents must NEVER execute this against the project (no db push, no MCP SQL).
-- Paste the full contents of this file into the Dashboard → SQL Editor → Run.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extend tour_credits with Work History fields
-- ---------------------------------------------------------------------------

alter table public.tour_credits
  add column if not exists engagement_type text,
  add column if not exists started_at date,
  add column if not exists ended_at date,
  add column if not exists is_current boolean not null default false,
  add column if not exists notes text;

comment on column public.tour_credits.engagement_type is
  'Engagement format: Touring, Run of Shows, Festival, One-Off, Local / Day-Of';

comment on column public.tour_credits.started_at is
  'Approximate start date of the engagement.';

comment on column public.tour_credits.ended_at is
  'Approximate end date of the engagement. Null when is_current is true.';

comment on column public.tour_credits.is_current is
  'True when the engagement is still ongoing (no end date).';

comment on column public.tour_credits.notes is
  'Optional free-form notes (e.g. "62 dates, North America leg").';

-- ---------------------------------------------------------------------------
-- Per-credit vouches
-- ---------------------------------------------------------------------------

create table if not exists public.credit_vouches (
  id uuid primary key default gen_random_uuid(),
  credit_id uuid not null references public.tour_credits (id) on delete cascade,
  voucher_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (credit_id, voucher_id)
);

create index if not exists credit_vouches_credit_id_idx
  on public.credit_vouches (credit_id);

create index if not exists credit_vouches_voucher_id_idx
  on public.credit_vouches (voucher_id);

comment on table public.credit_vouches is
  'Per-credit peer vouches. A member can vouch for any single tour credit once.';

-- ---------------------------------------------------------------------------
-- Row Level Security for credit_vouches
-- ---------------------------------------------------------------------------

alter table public.credit_vouches enable row level security;

-- Any authenticated user can see vouches (for vouch counts and UI state)
create policy "credit_vouches_select_authenticated"
  on public.credit_vouches
  for select
  to authenticated
  using (true);

-- Members can vouch for credits that are NOT their own
create policy "credit_vouches_insert_own"
  on public.credit_vouches
  for insert
  to authenticated
  with check (
    voucher_id = auth.uid()
    and not exists (
      select 1
      from public.tour_credits tc
      where tc.id = credit_id
        and tc.profile_id = auth.uid()
    )
  );

-- Members can remove their own vouch
create policy "credit_vouches_delete_own"
  on public.credit_vouches
  for delete
  to authenticated
  using (voucher_id = auth.uid());

-- =============================================================================
