-- =============================================================================
-- Migration: create_dm_tables
--
-- IMPORTANT: Run this manually in the Supabase SQL Editor.
-- Agents must NEVER execute this against the project (no db push, no MCP SQL).
-- Paste the full contents of this file into the Dashboard → SQL Editor → Run.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Direct message conversations (1:1)
-- ---------------------------------------------------------------------------

create table public.dm_conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index dm_conversations_updated_at_idx
  on public.dm_conversations (updated_at desc);

comment on table public.dm_conversations is
  '1:1 direct message threads between two network members.';

-- Canonical pair lookup so the same two profiles always share one conversation.
create table public.dm_conversation_pairs (
  profile_a uuid not null references public.profiles (id) on delete cascade,
  profile_b uuid not null references public.profiles (id) on delete cascade,
  conversation_id uuid not null unique references public.dm_conversations (id) on delete cascade,
  primary key (profile_a, profile_b),
  constraint dm_conversation_pairs_ordered check (profile_a < profile_b)
);

create index dm_conversation_pairs_profile_a_idx
  on public.dm_conversation_pairs (profile_a);
create index dm_conversation_pairs_profile_b_idx
  on public.dm_conversation_pairs (profile_b);

-- ---------------------------------------------------------------------------
-- Participants + read state
-- ---------------------------------------------------------------------------

create table public.dm_participants (
  conversation_id uuid not null references public.dm_conversations (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  last_read_at timestamptz,
  joined_at timestamptz not null default now(),
  primary key (conversation_id, profile_id)
);

create index dm_participants_profile_id_idx
  on public.dm_participants (profile_id);

-- ---------------------------------------------------------------------------
-- Messages
-- ---------------------------------------------------------------------------

create table public.dm_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.dm_conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(trim(body)) > 0),
  created_at timestamptz not null default now()
);

create index dm_messages_conversation_created_idx
  on public.dm_messages (conversation_id, created_at desc);

-- ---------------------------------------------------------------------------
-- updated_at trigger for conversations
-- ---------------------------------------------------------------------------

create or replace function public.set_dm_conversations_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger dm_conversations_set_updated_at
  before update on public.dm_conversations
  for each row
  execute function public.set_dm_conversations_updated_at();

create or replace function public.bump_dm_conversation_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.dm_conversations
  set updated_at = now()
  where id = new.conversation_id;
  return new;
end;
$$;

create trigger dm_messages_bump_conversation
  after insert on public.dm_messages
  for each row
  execute function public.bump_dm_conversation_updated_at();

-- ---------------------------------------------------------------------------
-- RLS helpers
-- ---------------------------------------------------------------------------

create or replace function public.is_dm_participant(conversation uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.dm_participants p
    where p.conversation_id = conversation
      and p.profile_id = auth.uid()
  );
$$;

revoke all on function public.is_dm_participant(uuid) from public;
grant execute on function public.is_dm_participant(uuid) to authenticated;

-- Allow members to read active profiles for messaging / directory.
create policy "profiles_select_active_members"
  on public.profiles
  for select
  to authenticated
  using (status = 'active'::public.user_status);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.dm_conversations enable row level security;
alter table public.dm_conversation_pairs enable row level security;
alter table public.dm_participants enable row level security;
alter table public.dm_messages enable row level security;

-- Conversations: participants only
create policy "dm_conversations_select_participant"
  on public.dm_conversations
  for select
  to authenticated
  using (public.is_dm_participant(id));

create policy "dm_conversations_insert_authenticated"
  on public.dm_conversations
  for insert
  to authenticated
  with check (true);

-- Pairs: participants of linked conversation
create policy "dm_conversation_pairs_select_participant"
  on public.dm_conversation_pairs
  for select
  to authenticated
  using (public.is_dm_participant(conversation_id));

create policy "dm_conversation_pairs_insert_authenticated"
  on public.dm_conversation_pairs
  for insert
  to authenticated
  with check (profile_a = auth.uid() or profile_b = auth.uid());

-- Participants
create policy "dm_participants_select_participant"
  on public.dm_participants
  for select
  to authenticated
  using (public.is_dm_participant(conversation_id));

create policy "dm_participants_insert_self"
  on public.dm_participants
  for insert
  to authenticated
  with check (profile_id = auth.uid() or public.is_dm_participant(conversation_id));

create policy "dm_participants_update_own_read"
  on public.dm_participants
  for update
  to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- Messages
create policy "dm_messages_select_participant"
  on public.dm_messages
  for select
  to authenticated
  using (public.is_dm_participant(conversation_id));

create policy "dm_messages_insert_participant"
  on public.dm_messages
  for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and public.is_dm_participant(conversation_id)
  );

-- ---------------------------------------------------------------------------
-- Realtime
-- ---------------------------------------------------------------------------

alter publication supabase_realtime add table public.dm_messages;

-- =============================================================================
