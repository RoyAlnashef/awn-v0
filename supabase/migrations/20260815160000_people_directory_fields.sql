-- =============================================================================
-- Migration: people_directory_fields
--
-- IMPORTANT: Run this manually in the Supabase SQL Editor.
-- Agents must NEVER execute this against the project (no db push, no MCP SQL).
-- Paste the full contents of this file into the Dashboard → SQL Editor → Run.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extend profiles with department
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column if not exists department text;

comment on column public.profiles.department is
  'Primary touring department for directory cards and filters (Production, Audio, etc.).';

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.connection_status as enum ('pending', 'accepted', 'ignored');

-- ---------------------------------------------------------------------------
-- Tour credits
-- ---------------------------------------------------------------------------

create table public.tour_credits (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  artist text,
  role text not null,
  venue_tier public.venue_tier,
  years text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index tour_credits_profile_id_idx on public.tour_credits (profile_id);
create index tour_credits_profile_sort_idx on public.tour_credits (profile_id, sort_order);

comment on table public.tour_credits is
  'Member tour credits shown on profile cards and the account tour credits page.';

-- ---------------------------------------------------------------------------
-- Profile-level vouches
-- ---------------------------------------------------------------------------

create table public.profile_vouches (
  id uuid primary key default gen_random_uuid(),
  vouchee_id uuid not null references public.profiles (id) on delete cascade,
  voucher_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint profile_vouches_no_self check (vouchee_id <> voucher_id),
  unique (vouchee_id, voucher_id)
);

create index profile_vouches_vouchee_id_idx on public.profile_vouches (vouchee_id);
create index profile_vouches_voucher_id_idx on public.profile_vouches (voucher_id);

comment on table public.profile_vouches is
  'Profile-level peer vouches ("I would work with this person again").';

-- ---------------------------------------------------------------------------
-- Member connections
-- ---------------------------------------------------------------------------

create table public.member_connections (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.profiles (id) on delete cascade,
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  status public.connection_status not null default 'pending',
  created_at timestamptz not null default now(),
  constraint member_connections_no_self check (requester_id <> recipient_id),
  unique (requester_id, recipient_id)
);

create index member_connections_requester_id_idx on public.member_connections (requester_id);
create index member_connections_recipient_id_idx on public.member_connections (recipient_id);
create index member_connections_status_idx on public.member_connections (status);

comment on table public.member_connections is
  'Connect / follow relationships between members.';

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.tour_credits enable row level security;
alter table public.profile_vouches enable row level security;
alter table public.member_connections enable row level security;

-- Tour credits: owner manages own; active members readable by authenticated users
create policy "tour_credits_select_authenticated"
  on public.tour_credits
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = tour_credits.profile_id
        and p.status = 'active'::public.user_status
    )
  );

create policy "tour_credits_insert_own"
  on public.tour_credits
  for insert
  to authenticated
  with check (profile_id = auth.uid());

create policy "tour_credits_update_own"
  on public.tour_credits
  for update
  to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

create policy "tour_credits_delete_own"
  on public.tour_credits
  for delete
  to authenticated
  using (profile_id = auth.uid());

-- Profile vouches: authenticated read; insert/delete own vouch
create policy "profile_vouches_select_authenticated"
  on public.profile_vouches
  for select
  to authenticated
  using (true);

create policy "profile_vouches_insert_own"
  on public.profile_vouches
  for insert
  to authenticated
  with check (voucher_id = auth.uid());

create policy "profile_vouches_delete_own"
  on public.profile_vouches
  for delete
  to authenticated
  using (voucher_id = auth.uid());

-- Member connections: either party can read; requester inserts; recipient updates status
create policy "member_connections_select_participant"
  on public.member_connections
  for select
  to authenticated
  using (requester_id = auth.uid() or recipient_id = auth.uid());

create policy "member_connections_insert_requester"
  on public.member_connections
  for insert
  to authenticated
  with check (requester_id = auth.uid());

create policy "member_connections_update_recipient"
  on public.member_connections
  for update
  to authenticated
  using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());

create policy "member_connections_delete_participant"
  on public.member_connections
  for delete
  to authenticated
  using (requester_id = auth.uid() or recipient_id = auth.uid());

-- =============================================================================
