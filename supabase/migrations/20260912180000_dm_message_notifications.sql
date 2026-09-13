-- =============================================================================
-- Migration: dm_message_notifications
--
-- Aggregated DM notifications (one unread row per sender) + viewing pause signal.
--
-- IMPORTANT: Run this manually in the Supabase SQL Editor.
-- Agents must NEVER execute this against the project (no db push, no MCP SQL).
-- Paste the full contents of this file into the Dashboard → SQL Editor → Run.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Viewing state on profiles (server-visible pause for notification trigger)
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column if not exists viewing_conversation_id uuid
    references public.dm_conversations (id) on delete set null;

comment on column public.profiles.viewing_conversation_id is
  'When set, the member is actively viewing this DM thread; suppresses notification increments.';

-- ---------------------------------------------------------------------------
-- Notification aggregate columns
-- ---------------------------------------------------------------------------

alter table public.notifications
  add column if not exists sender_profile_id uuid
    references public.profiles (id) on delete cascade;

alter table public.notifications
  add column if not exists updated_at timestamptz not null default now();

create index if not exists notifications_sender_profile_id_idx
  on public.notifications (sender_profile_id)
  where sender_profile_id is not null;

create unique index if not exists notifications_dm_unread_sender_uidx
  on public.notifications (user_id, sender_profile_id)
  where kind = 'dm_message' and read = false;

comment on column public.notifications.sender_profile_id is
  'For dm_message rows: the sender whose messages are aggregated.';

comment on column public.notifications.updated_at is
  'Last aggregate update; used for sort order when count increments.';

-- ---------------------------------------------------------------------------
-- RPC: set viewing conversation (pause notification increments)
-- ---------------------------------------------------------------------------

create or replace function public.set_viewing_conversation(p_conversation_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_id uuid := auth.uid();
begin
  if current_id is null then
    raise exception 'Not authenticated';
  end if;

  if p_conversation_id is null then
    update public.profiles
    set viewing_conversation_id = null
    where id = current_id;
    return;
  end if;

  if not exists (
    select 1
    from public.dm_participants p
    where p.conversation_id = p_conversation_id
      and p.profile_id = current_id
  ) then
    raise exception 'Not a participant in this conversation';
  end if;

  update public.profiles
  set viewing_conversation_id = p_conversation_id
  where id = current_id;
end;
$$;

revoke all on function public.set_viewing_conversation(uuid) from public;
grant execute on function public.set_viewing_conversation(uuid) to authenticated;

comment on function public.set_viewing_conversation(uuid) is
  'Sets or clears the DM conversation the current user is viewing (pauses notification increments).';

-- ---------------------------------------------------------------------------
-- RPC: dismiss aggregated DM notification when opening a thread
-- ---------------------------------------------------------------------------

create or replace function public.dismiss_dm_notification(p_conversation_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_id uuid := auth.uid();
begin
  if current_id is null then
    raise exception 'Not authenticated';
  end if;

  if p_conversation_id is null then
    return;
  end if;

  update public.notifications
  set read = true
  where user_id = current_id
    and kind = 'dm_message'
    and read = false
    and data->>'conversationId' = p_conversation_id::text;
end;
$$;

revoke all on function public.dismiss_dm_notification(uuid) from public;
grant execute on function public.dismiss_dm_notification(uuid) to authenticated;

comment on function public.dismiss_dm_notification(uuid) is
  'Marks unread dm_message notifications for the given conversation as read.';

-- ---------------------------------------------------------------------------
-- Trigger: upsert aggregated DM notification on new message
-- ---------------------------------------------------------------------------

create or replace function public.upsert_dm_message_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  recipient_id uuid;
  sender_name text;
  preview text;
begin
  -- Resolve recipient (the other participant)
  select p.profile_id
  into recipient_id
  from public.dm_participants p
  where p.conversation_id = new.conversation_id
    and p.profile_id is distinct from new.sender_id
  limit 1;

  if recipient_id is null then
    return new;
  end if;

  -- Pause while recipient is viewing this conversation
  if exists (
    select 1
    from public.profiles pr
    where pr.id = recipient_id
      and pr.viewing_conversation_id = new.conversation_id
  ) then
    return new;
  end if;

  select coalesce(pr.full_name, 'Member')
  into sender_name
  from public.profiles pr
  where pr.id = new.sender_id;

  preview := public.message_preview_body(
    new.body,
    new.job_id,
    new.shared_profile_id,
    new.member_share_snapshot
  );

  insert into public.notifications (
    user_id,
    kind,
    title,
    body,
    sender_profile_id,
    data,
    read,
    created_at,
    updated_at
  )
  values (
    recipient_id,
    'dm_message',
    sender_name,
    preview,
    new.sender_id,
    jsonb_build_object(
      'conversationId', new.conversation_id,
      'messageCount', 1,
      'latestMessageId', new.id
    ),
    false,
    now(),
    now()
  )
  on conflict (user_id, sender_profile_id)
    where kind = 'dm_message' and read = false
  do update set
    updated_at = now(),
    data = jsonb_build_object(
      'conversationId', new.conversation_id,
      'messageCount',
      coalesce((public.notifications.data->>'messageCount')::int, 1) + 1,
      'latestMessageId', new.id
    ),
    body = case
      when coalesce((public.notifications.data->>'messageCount')::int, 1) + 1 > 1 then
        (coalesce((public.notifications.data->>'messageCount')::int, 1) + 1)::text
        || ' new messages'
      else excluded.body
    end;

  return new;
end;
$$;

drop trigger if exists dm_messages_upsert_notification on public.dm_messages;

create trigger dm_messages_upsert_notification
  after insert on public.dm_messages
  for each row
  execute function public.upsert_dm_message_notification();

comment on function public.upsert_dm_message_notification() is
  'Creates or increments an aggregated dm_message notification for the recipient.';

-- =============================================================================
