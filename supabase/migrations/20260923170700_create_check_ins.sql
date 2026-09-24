-- =============================================================================
-- Migration: create_check_ins
--
-- IMPORTANT: Run this manually in the Supabase SQL Editor.
-- Agents must NEVER execute this against the project (no db push, no MCP SQL).
-- Paste the full contents of this file into the Dashboard → SQL Editor → Run.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Check-ins (On The Road map)
-- ---------------------------------------------------------------------------

create table public.check_ins (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  latitude double precision not null,
  longitude double precision not null,
  city text,
  checked_in_at timestamptz not null default now()
);

create index check_ins_checked_in_at_idx on public.check_ins (checked_in_at desc);
create index check_ins_lat_lng_idx on public.check_ins (latitude, longitude);

comment on table public.check_ins is
  'Member map check-ins for the Now "Who''s around" map. One active row per member; stale after 24h.';

comment on column public.check_ins.city is
  'Reverse-geocoded place label shown in the nearby overlay (e.g. Denver).';

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.check_ins enable row level security;

-- Authenticated members can read fresh check-ins (last 24 hours)
create policy "check_ins_select_fresh"
  on public.check_ins
  for select
  to authenticated
  using (checked_in_at > now() - interval '24 hours');

-- Members can insert their own check-in
create policy "check_ins_insert_own"
  on public.check_ins
  for insert
  to authenticated
  with check (profile_id = auth.uid());

-- Members can update their own check-in
create policy "check_ins_update_own"
  on public.check_ins
  for update
  to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- Members can delete their own check-in
create policy "check_ins_delete_own"
  on public.check_ins
  for delete
  to authenticated
  using (profile_id = auth.uid());
