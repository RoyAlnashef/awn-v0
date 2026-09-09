-- =============================================================================
-- Migration: appear_offline
--
-- Run manually in Supabase SQL Editor.
-- Lets users hide their online indicator from other AWN members while staying
-- active in the app.
-- =============================================================================

alter table public.profiles
  add column if not exists appear_offline boolean not null default false;

comment on column public.profiles.appear_offline is
  'When true, other members never see this user as online regardless of last_active_at.';

-- ---------------------------------------------------------------------------
-- Toggle appear-offline preference for the current user
-- ---------------------------------------------------------------------------

create or replace function public.set_appear_offline(p_enabled boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return;
  end if;

  update public.profiles
  set appear_offline = p_enabled
  where id = auth.uid();
end;
$$;

revoke all on function public.set_appear_offline(boolean) from public;
grant execute on function public.set_appear_offline(boolean) to authenticated;

-- ---------------------------------------------------------------------------
-- Inbox: include other member appear_offline for online dot gating
-- (return type changed — must drop before recreate)
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
    other_p.appear_offline as other_appear_offline,
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
