-- =============================================================================
-- Migration: dm_performance
--
-- Run manually in Supabase SQL Editor after create_dm_tables + fix migration.
-- Denormalized inbox previews + single-query inbox/thread/unread RPCs.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Denormalized preview columns on dm_conversations
-- ---------------------------------------------------------------------------

alter table public.dm_conversations
  add column if not exists last_message_body text,
  add column if not exists last_message_sender_id uuid references public.profiles (id) on delete set null,
  add column if not exists last_message_at timestamptz;

-- ---------------------------------------------------------------------------
-- Sync preview + updated_at on new messages
-- ---------------------------------------------------------------------------

create or replace function public.bump_dm_conversation_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.dm_conversations
  set
    updated_at = now(),
    last_message_body = new.body,
    last_message_sender_id = new.sender_id,
    last_message_at = new.created_at
  where id = new.conversation_id;

  return new;
end;
$$;

-- Backfill preview columns from existing messages
update public.dm_conversations c
set
  last_message_body = latest.body,
  last_message_sender_id = latest.sender_id,
  last_message_at = latest.created_at,
  updated_at = greatest(c.updated_at, latest.created_at)
from (
  select distinct on (conversation_id)
    conversation_id,
    body,
    sender_id,
    created_at
  from public.dm_messages
  order by conversation_id, created_at desc
) as latest
where c.id = latest.conversation_id;

-- ---------------------------------------------------------------------------
-- Inbox: single query for all conversations
-- ---------------------------------------------------------------------------

create or replace function public.list_dm_inbox()
returns table (
  conversation_id uuid,
  other_profile_id uuid,
  other_name text,
  other_title text,
  other_avatar_url text,
  other_last_active_at timestamptz,
  last_message_body text,
  last_message_sender_id uuid,
  last_message_at timestamptz,
  my_last_read_at timestamptz,
  conversation_updated_at timestamptz
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
    c.last_message_body,
    c.last_message_sender_id,
    c.last_message_at,
    mine.last_read_at as my_last_read_at,
    c.updated_at as conversation_updated_at
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

-- ---------------------------------------------------------------------------
-- Thread page: messages + read state in one round trip
-- ---------------------------------------------------------------------------

create or replace function public.get_dm_thread(
  p_conversation_id uuid,
  p_page_limit int default 50,
  p_before timestamptz default null
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  current_id uuid := auth.uid();
  other_read timestamptz;
  page_limit int := greatest(1, least(coalesce(p_page_limit, 50), 100));
  fetched_count int;
  result jsonb;
begin
  if current_id is null then
    raise exception 'Not authenticated';
  end if;

  if not public.is_dm_participant(p_conversation_id) then
    raise exception 'Not a participant';
  end if;

  select p.last_read_at
  into other_read
  from public.dm_participants p
  where p.conversation_id = p_conversation_id
    and p.profile_id <> current_id
  limit 1;

  with page as (
    select m.id, m.sender_id, m.body, m.created_at
    from public.dm_messages m
    where m.conversation_id = p_conversation_id
      and (p_before is null or m.created_at < p_before)
    order by m.created_at desc
    limit page_limit + 1
  ),
  trimmed as (
    select *
    from page
    order by created_at asc
    limit page_limit
  )
  select jsonb_build_object(
    'messages', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', t.id,
            'sender_id', t.sender_id,
            'body', t.body,
            'created_at', t.created_at
          )
          order by t.created_at asc
        )
        from trimmed t
      ),
      '[]'::jsonb
    ),
    'other_last_read_at', other_read,
    'has_more', (select count(*) > page_limit from page)
  )
  into result;

  return result;
end;
$$;

revoke all on function public.get_dm_thread(uuid, int, timestamptz) from public;
grant execute on function public.get_dm_thread(uuid, int, timestamptz) to authenticated;

-- ---------------------------------------------------------------------------
-- Lightweight unread count for nav badges
-- ---------------------------------------------------------------------------

create or replace function public.get_dm_unread_count()
returns int
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int
  from public.dm_participants mine
  join public.dm_conversations c
    on c.id = mine.conversation_id
  where mine.profile_id = auth.uid()
    and c.last_message_at is not null
    and c.last_message_sender_id is distinct from auth.uid()
    and (
      mine.last_read_at is null
      or c.last_message_at > mine.last_read_at
    );
$$;

revoke all on function public.get_dm_unread_count() from public;
grant execute on function public.get_dm_unread_count() to authenticated;

-- =============================================================================
