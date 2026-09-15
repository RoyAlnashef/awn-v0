-- =============================================================================
-- Migration: room_mentions_and_notifications
--
-- Group @ mentions on room_messages + aggregated room_mention / room_reply
-- notifications, viewing pause, and dismiss RPCs.
--
-- IMPORTANT: Run this manually in the Supabase SQL Editor.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Mention columns on room_messages
-- ---------------------------------------------------------------------------

alter table public.room_messages
  add column if not exists mentioned_profile_ids uuid[] not null default '{}';

alter table public.room_messages
  add column if not exists mention_spans jsonb not null default '[]'::jsonb;

comment on column public.room_messages.mentioned_profile_ids is
  'Profile IDs @mentioned in this message body.';

comment on column public.room_messages.mention_spans is
  'Render spans: [{ profileId, start, length }] aligned to body text.';

-- ---------------------------------------------------------------------------
-- Viewing state on profiles (pause room notification increments)
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column if not exists viewing_room_id uuid
    references public.community_rooms (id) on delete set null;

comment on column public.profiles.viewing_room_id is
  'When set, the member is actively viewing this room thread; suppresses room mention/reply notification increments.';

-- ---------------------------------------------------------------------------
-- Notification room aggregate column
-- ---------------------------------------------------------------------------

alter table public.notifications
  add column if not exists room_id uuid
    references public.community_rooms (id) on delete cascade;

create index if not exists notifications_room_id_idx
  on public.notifications (room_id)
  where room_id is not null;

create unique index if not exists notifications_room_mention_unread_uidx
  on public.notifications (user_id, room_id)
  where kind = 'room_mention' and read = false;

create unique index if not exists notifications_room_reply_unread_uidx
  on public.notifications (user_id, room_id)
  where kind = 'room_reply' and read = false;

comment on column public.notifications.room_id is
  'For room_mention / room_reply rows: the group being aggregated.';

-- ---------------------------------------------------------------------------
-- RPC: set viewing room (pause notification increments)
-- ---------------------------------------------------------------------------

create or replace function public.set_viewing_room(p_room_id uuid)
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

  if p_room_id is null then
    update public.profiles
    set viewing_room_id = null
    where id = current_id;
    return;
  end if;

  if not exists (
    select 1
    from public.room_memberships m
    where m.room_id = p_room_id
      and m.profile_id = current_id
  ) then
    raise exception 'Not a member of this room';
  end if;

  update public.profiles
  set viewing_room_id = p_room_id
  where id = current_id;
end;
$$;

revoke all on function public.set_viewing_room(uuid) from public;
grant execute on function public.set_viewing_room(uuid) to authenticated;

comment on function public.set_viewing_room(uuid) is
  'Sets or clears the room the current user is viewing (pauses room mention/reply notification increments).';

-- ---------------------------------------------------------------------------
-- RPC: dismiss room mention/reply notifications when opening a thread
-- ---------------------------------------------------------------------------

create or replace function public.dismiss_room_notifications(p_room_id uuid)
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

  if p_room_id is null then
    return;
  end if;

  update public.notifications
  set read = true
  where user_id = current_id
    and room_id = p_room_id
    and kind in ('room_mention', 'room_reply')
    and read = false;
end;
$$;

revoke all on function public.dismiss_room_notifications(uuid) from public;
grant execute on function public.dismiss_room_notifications(uuid) to authenticated;

comment on function public.dismiss_room_notifications(uuid) is
  'Marks unread room_mention and room_reply notifications for the given room as read.';

-- ---------------------------------------------------------------------------
-- Helper: upsert a room mention notification for one recipient
-- ---------------------------------------------------------------------------

create or replace function public.upsert_room_mention_notification(
  p_recipient_id uuid,
  p_sender_id uuid,
  p_room_id uuid,
  p_message_id uuid,
  p_sender_name text,
  p_room_name text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_recipient_id is null or p_recipient_id = p_sender_id then
    return;
  end if;

  if exists (
    select 1
    from public.room_memberships m
    where m.room_id = p_room_id
      and m.profile_id = p_recipient_id
      and m.muted_at is not null
  ) then
    return;
  end if;

  if exists (
    select 1
    from public.profiles pr
    where pr.id = p_recipient_id
      and pr.viewing_room_id = p_room_id
  ) then
    return;
  end if;

  insert into public.notifications (
    user_id,
    kind,
    title,
    body,
    sender_profile_id,
    room_id,
    data,
    read,
    created_at,
    updated_at
  )
  values (
    p_recipient_id,
    'room_mention',
    p_sender_name || ' mentioned you in the group',
    p_room_name,
    p_sender_id,
    p_room_id,
    jsonb_build_object(
      'roomId', p_room_id,
      'mentionCount', 1,
      'latestMessageId', p_message_id
    ),
    false,
    now(),
    now()
  )
  on conflict (user_id, room_id)
    where kind = 'room_mention' and read = false
  do update set
    updated_at = now(),
    sender_profile_id = excluded.sender_profile_id,
    data = jsonb_build_object(
      'roomId', p_room_id,
      'mentionCount',
      coalesce((public.notifications.data->>'mentionCount')::int, 1) + 1,
      'latestMessageId', p_message_id
    ),
    title = case
      when coalesce((public.notifications.data->>'mentionCount')::int, 1) + 1 > 1 then
        'You''ve been mentioned '
        || (coalesce((public.notifications.data->>'mentionCount')::int, 1) + 1)::text
        || ' times in the group'
      else excluded.title
    end,
    body = excluded.body;
end;
$$;

comment on function public.upsert_room_mention_notification(uuid, uuid, uuid, uuid, text, text) is
  'Creates or increments an aggregated room_mention notification for one recipient.';

-- ---------------------------------------------------------------------------
-- Helper: upsert a room reply notification for one recipient
-- ---------------------------------------------------------------------------

create or replace function public.upsert_room_reply_notification(
  p_recipient_id uuid,
  p_sender_id uuid,
  p_room_id uuid,
  p_message_id uuid,
  p_sender_name text,
  p_room_name text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_recipient_id is null or p_recipient_id = p_sender_id then
    return;
  end if;

  if exists (
    select 1
    from public.room_memberships m
    where m.room_id = p_room_id
      and m.profile_id = p_recipient_id
      and m.muted_at is not null
  ) then
    return;
  end if;

  if exists (
    select 1
    from public.profiles pr
    where pr.id = p_recipient_id
      and pr.viewing_room_id = p_room_id
  ) then
    return;
  end if;

  insert into public.notifications (
    user_id,
    kind,
    title,
    body,
    sender_profile_id,
    room_id,
    data,
    read,
    created_at,
    updated_at
  )
  values (
    p_recipient_id,
    'room_reply',
    p_sender_name || ' replied to you in the group',
    p_room_name,
    p_sender_id,
    p_room_id,
    jsonb_build_object(
      'roomId', p_room_id,
      'replyCount', 1,
      'latestMessageId', p_message_id
    ),
    false,
    now(),
    now()
  )
  on conflict (user_id, room_id)
    where kind = 'room_reply' and read = false
  do update set
    updated_at = now(),
    sender_profile_id = excluded.sender_profile_id,
    data = jsonb_build_object(
      'roomId', p_room_id,
      'replyCount',
      coalesce((public.notifications.data->>'replyCount')::int, 1) + 1,
      'latestMessageId', p_message_id
    ),
    title = case
      when coalesce((public.notifications.data->>'replyCount')::int, 1) + 1 > 1 then
        'You have '
        || (coalesce((public.notifications.data->>'replyCount')::int, 1) + 1)::text
        || ' replies in the group'
      else excluded.title
    end,
    body = excluded.body;
end;
$$;

comment on function public.upsert_room_reply_notification(uuid, uuid, uuid, uuid, text, text) is
  'Creates or increments an aggregated room_reply notification for one recipient.';

-- ---------------------------------------------------------------------------
-- Trigger: room mention + reply notifications on new message
-- ---------------------------------------------------------------------------

create or replace function public.upsert_room_message_notifications()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  sender_name text;
  room_name text;
  reply_author_id uuid;
  mentioned_id uuid;
begin
  select coalesce(pr.full_name, 'Member')
  into sender_name
  from public.profiles pr
  where pr.id = new.sender_id;

  select coalesce(r.name, 'Group')
  into room_name
  from public.community_rooms r
  where r.id = new.room_id;

  if new.mentioned_profile_ids is not null then
    foreach mentioned_id in array new.mentioned_profile_ids
    loop
      perform public.upsert_room_mention_notification(
        mentioned_id,
        new.sender_id,
        new.room_id,
        new.id,
        sender_name,
        room_name
      );
    end loop;
  end if;

  if new.reply_to_message_id is not null then
    select rm.sender_id
    into reply_author_id
    from public.room_messages rm
    where rm.id = new.reply_to_message_id;

    if reply_author_id is not null then
      perform public.upsert_room_reply_notification(
        reply_author_id,
        new.sender_id,
        new.room_id,
        new.id,
        sender_name,
        room_name
      );
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists room_messages_upsert_notifications on public.room_messages;

create trigger room_messages_upsert_notifications
  after insert on public.room_messages
  for each row
  execute function public.upsert_room_message_notifications();

comment on function public.upsert_room_message_notifications() is
  'Creates or increments aggregated room_mention and room_reply notifications.';

-- ---------------------------------------------------------------------------
-- get_room_thread — include mention spans
-- ---------------------------------------------------------------------------

create or replace function public.get_room_thread(
  p_room_id uuid,
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
  page_limit int := greatest(1, least(coalesce(p_page_limit, 50), 100));
  result jsonb;
begin
  if current_id is null then
    raise exception 'Not authenticated';
  end if;

  if not exists (
    select 1 from public.community_rooms r
    where r.id = p_room_id and r.is_archived = false
  ) then
    raise exception 'Room not found';
  end if;

  with page as (
    select
      m.id,
      m.sender_id,
      m.body,
      m.created_at,
      m.job_id,
      m.mentioned_profile_ids,
      m.mention_spans,
      p.full_name as sender_name,
      p.avatar_url as sender_avatar_url,
      j.role as job_role,
      j.production as job_production,
      j.location as job_location,
      j.pay_rate as job_pay_rate,
      j.start_date as job_start_date,
      j.end_date as job_end_date,
      j.engagement::text as job_engagement,
      j.department as job_department,
      j.kind::text as job_kind,
      j.created_at as job_created_at,
      m.shared_profile_id,
      sp.full_name as shared_profile_name,
      sp.title as shared_profile_title,
      sp.avatar_url as shared_profile_avatar_url,
      m.member_share_snapshot,
      m.reply_to_message_id,
      m.reply_snapshot,
      rm.id as reply_msg_id,
      rm.body as reply_body,
      rm.sender_id as reply_sender_id,
      rp.full_name as reply_sender_name,
      rm.job_id as reply_job_id,
      rj.role as reply_job_role,
      rj.production as reply_job_production,
      rj.location as reply_job_location,
      rj.pay_rate as reply_job_pay_rate,
      rj.start_date as reply_job_start_date,
      rj.end_date as reply_job_end_date,
      rj.engagement::text as reply_job_engagement,
      rj.department as reply_job_department,
      rj.kind::text as reply_job_kind,
      rj.created_at as reply_job_created_at
    from public.room_messages m
    join public.profiles p on p.id = m.sender_id
    left join public.job_postings j on j.id = m.job_id
    left join public.profiles sp on sp.id = m.shared_profile_id
    left join public.room_messages rm on rm.id = m.reply_to_message_id
    left join public.profiles rp on rp.id = rm.sender_id
    left join public.job_postings rj on rj.id = rm.job_id
    where m.room_id = p_room_id
      and (p_before is null or m.created_at < p_before)
    order by m.created_at desc
    limit page_limit + 1
  ),
  trimmed as (
    select *
    from (
      select *
      from page
      order by created_at desc
      limit page_limit
    ) recent
    order by created_at asc
  )
  select jsonb_build_object(
    'messages', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', t.id,
            'sender_id', t.sender_id,
            'sender_name', t.sender_name,
            'sender_avatar_url', t.sender_avatar_url,
            'body', t.body,
            'created_at', t.created_at,
            'mentioned_profile_ids', t.mentioned_profile_ids,
            'mention_spans', t.mention_spans,
            'job_id', t.job_id,
            'job_role', t.job_role,
            'job_production', t.job_production,
            'job_location', t.job_location,
            'job_pay_rate', t.job_pay_rate,
            'job_start_date', t.job_start_date,
            'job_end_date', t.job_end_date,
            'job_engagement', t.job_engagement,
            'job_department', t.job_department,
            'job_kind', t.job_kind,
            'job_created_at', t.job_created_at,
            'shared_profile_id', t.shared_profile_id,
            'shared_profile_name', t.shared_profile_name,
            'shared_profile_title', t.shared_profile_title,
            'shared_profile_avatar_url', t.shared_profile_avatar_url,
            'member_share_snapshot', t.member_share_snapshot,
            'reply_to_message_id', t.reply_to_message_id,
            'reply_snapshot', t.reply_snapshot,
            'reply_body', t.reply_body,
            'reply_sender_id', t.reply_sender_id,
            'reply_sender_name', t.reply_sender_name,
            'reply_job_id', t.reply_job_id,
            'reply_job_role', t.reply_job_role,
            'reply_job_production', t.reply_job_production,
            'reply_job_location', t.reply_job_location,
            'reply_job_pay_rate', t.reply_job_pay_rate,
            'reply_job_start_date', t.reply_job_start_date,
            'reply_job_end_date', t.reply_job_end_date,
            'reply_job_engagement', t.reply_job_engagement,
            'reply_job_department', t.reply_job_department,
            'reply_job_kind', t.reply_job_kind,
            'reply_job_created_at', t.reply_job_created_at,
            'reactions', coalesce(
              (
                select jsonb_agg(
                  jsonb_build_object(
                    'emoji', agg.emoji,
                    'count', agg.cnt,
                    'reacted_by_me', agg.reacted_by_me,
                    'reactors', agg.reactors
                  )
                  order by agg.cnt desc, agg.emoji
                )
                from (
                  select
                    r.emoji,
                    count(*)::int as cnt,
                    bool_or(r.profile_id = current_id) as reacted_by_me,
                    jsonb_agg(
                      jsonb_build_object(
                        'id', r.profile_id,
                        'name', coalesce(pr.full_name, 'Member')
                      )
                      order by r.created_at
                    ) as reactors
                  from public.room_message_reactions r
                  join public.profiles pr on pr.id = r.profile_id
                  where r.message_id = t.id
                    and r.target = 'body'
                  group by r.emoji
                ) agg
              ),
              '[]'::jsonb
            ),
            'attachment_reactions', coalesce(
              (
                select jsonb_agg(
                  jsonb_build_object(
                    'emoji', agg.emoji,
                    'count', agg.cnt,
                    'reacted_by_me', agg.reacted_by_me,
                    'reactors', agg.reactors
                  )
                  order by agg.cnt desc, agg.emoji
                )
                from (
                  select
                    r.emoji,
                    count(*)::int as cnt,
                    bool_or(r.profile_id = current_id) as reacted_by_me,
                    jsonb_agg(
                      jsonb_build_object(
                        'id', r.profile_id,
                        'name', coalesce(pr.full_name, 'Member')
                      )
                      order by r.created_at
                    ) as reactors
                  from public.room_message_reactions r
                  join public.profiles pr on pr.id = r.profile_id
                  where r.message_id = t.id
                    and r.target = 'attachment'
                  group by r.emoji
                ) agg
              ),
              '[]'::jsonb
            )
          )
          order by t.created_at
        )
        from trimmed t
      ),
      '[]'::jsonb
    ),
    'has_more', (select count(*) > page_limit from page)
  )
  into result;

  return result;
end;
$$;

revoke all on function public.get_room_thread(uuid, int, timestamptz) from public;
grant execute on function public.get_room_thread(uuid, int, timestamptz) to authenticated;

-- =============================================================================
