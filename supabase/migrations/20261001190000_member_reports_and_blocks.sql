-- =============================================================================
-- Migration: member_reports_and_blocks
--
-- IMPORTANT: Run this manually in the Supabase SQL Editor.
-- Agents must NEVER execute this against the project (no db push, no MCP SQL).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Platform member blocks (mutual enforcement in app + selected RPCs)
-- ---------------------------------------------------------------------------

create table if not exists public.member_blocks (
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  constraint member_blocks_no_self check (blocker_id <> blocked_id)
);

create index if not exists member_blocks_blocked_id_idx
  on public.member_blocks (blocked_id);

comment on table public.member_blocks is
  'Member-initiated blocks; either direction hides the pair across the network.';

alter table public.member_blocks enable row level security;

create policy "member_blocks_select_participant_or_admin"
  on public.member_blocks
  for select
  to authenticated
  using (
    blocker_id = auth.uid()
    or blocked_id = auth.uid()
    or public.is_admin()
  );

create policy "member_blocks_insert_self_as_blocker"
  on public.member_blocks
  for insert
  to authenticated
  with check (blocker_id = auth.uid());

create policy "member_blocks_delete_participant"
  on public.member_blocks
  for delete
  to authenticated
  using (blocker_id = auth.uid() or blocked_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Member reports (admin triage)
-- ---------------------------------------------------------------------------

create table if not exists public.member_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reportee_id uuid not null references public.profiles (id) on delete cascade,
  reason text not null,
  blocked_on_submit boolean not null default false,
  dismissed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint member_reports_no_self check (reporter_id <> reportee_id),
  constraint member_reports_reason_check check (
    reason in (
      'fake_or_misleading_profile',
      'harassment_or_threatening',
      'spam_or_solicitation',
      'inappropriate_content',
      'impersonating_someone',
      'other'
    )
  )
);

create unique index if not exists member_reports_one_open_per_pair_idx
  on public.member_reports (reporter_id, reportee_id)
  where dismissed_at is null;

create index if not exists member_reports_created_at_idx
  on public.member_reports (created_at desc);

comment on table public.member_reports is
  'Member-submitted reports for admin review.';

alter table public.member_reports enable row level security;

create policy "member_reports_insert_self"
  on public.member_reports
  for insert
  to authenticated
  with check (reporter_id = auth.uid());

create policy "member_reports_select_own"
  on public.member_reports
  for select
  to authenticated
  using (reporter_id = auth.uid());

create policy "member_reports_select_admin"
  on public.member_reports
  for select
  to authenticated
  using (public.is_admin());

create policy "member_reports_update_admin"
  on public.member_reports
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- Helper: either-direction block check
-- ---------------------------------------------------------------------------

create or replace function public.members_are_blocked(p_a uuid, p_b uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.member_blocks b
    where (b.blocker_id = p_a and b.blocked_id = p_b)
       or (b.blocker_id = p_b and b.blocked_id = p_a)
  );
$$;

revoke all on function public.members_are_blocked(uuid, uuid) from public;
grant execute on function public.members_are_blocked(uuid, uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- DM: reject new conversations when blocked; keep existing threads
-- ---------------------------------------------------------------------------

create or replace function public.get_or_create_dm_conversation(other_profile_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_id uuid := auth.uid();
  conv_id uuid;
  pair_a uuid;
  pair_b uuid;
begin
  if current_id is null then
    raise exception 'Not authenticated';
  end if;

  if other_profile_id = current_id then
    raise exception 'Cannot message yourself';
  end if;

  pair_a := least(current_id, other_profile_id);
  pair_b := greatest(current_id, other_profile_id);

  select cp.conversation_id
  into conv_id
  from public.dm_conversation_pairs cp
  where cp.profile_a = pair_a
    and cp.profile_b = pair_b;

  if conv_id is not null then
    return conv_id;
  end if;

  if public.members_are_blocked(current_id, other_profile_id) then
    raise exception 'Cannot message this member';
  end if;

  insert into public.dm_conversations default values
  returning id into conv_id;

  insert into public.dm_participants (conversation_id, profile_id)
  values
    (conv_id, current_id),
    (conv_id, other_profile_id);

  insert into public.dm_conversation_pairs (profile_a, profile_b, conversation_id)
  values (pair_a, pair_b, conv_id);

  return conv_id;
end;
$$;

revoke all on function public.get_or_create_dm_conversation(uuid) from public;
grant execute on function public.get_or_create_dm_conversation(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- DM inbox: include messaging_blocked flag (threads stay visible)
-- ---------------------------------------------------------------------------

drop function if exists public.list_dm_inbox();

create or replace function public.list_dm_inbox()
returns table (
  conversation_id uuid,
  other_profile_id uuid,
  other_name text,
  other_title text,
  other_avatar_url text,
  other_last_active_at timestamptz,
  other_appear_offline boolean,
  last_message_body text,
  last_message_sender_id uuid,
  last_message_at timestamptz,
  my_last_read_at timestamptz,
  conversation_updated_at timestamptz,
  messaging_blocked boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    c.id as conversation_id,
    other_p.id as other_profile_id,
    coalesce(other_p.full_name, 'Member') as other_name,
    coalesce(other_p.title, 'AWN Member') as other_title,
    other_p.avatar_url as other_avatar_url,
    other_p.last_active_at as other_last_active_at,
    other_p.appear_offline as other_appear_offline,
    c.last_message_body,
    c.last_message_sender_id,
    c.last_message_at,
    mine.last_read_at as my_last_read_at,
    c.updated_at as conversation_updated_at,
    public.members_are_blocked(auth.uid(), other_p.id) as messaging_blocked
  from public.dm_participants mine
  join public.dm_conversations c
    on c.id = mine.conversation_id
  join public.dm_participants other_part
    on other_part.conversation_id = c.id
   and other_part.profile_id <> mine.profile_id
  join public.profiles other_p
    on other_p.id = other_part.profile_id
  where mine.profile_id = auth.uid()
  order by coalesce(c.last_message_at, c.updated_at) desc;
$$;

revoke all on function public.list_dm_inbox() from public;
grant execute on function public.list_dm_inbox() to authenticated;

-- =============================================================================
