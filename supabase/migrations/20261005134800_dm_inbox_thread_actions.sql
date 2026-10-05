-- =============================================================================
-- Migration: dm_inbox_thread_actions
--
-- DM inbox: mute, archive, hidden/cleared, per-user message hides.
-- Run manually in the Supabase SQL Editor.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Participant inbox state
-- ---------------------------------------------------------------------------

alter table public.dm_participants
  add column if not exists muted_at timestamptz,
  add column if not exists archived_at timestamptz,
  add column if not exists hidden_at timestamptz,
  add column if not exists cleared_at timestamptz;

comment on column public.dm_participants.muted_at is
  'When set, suppresses unread badges and push for this DM.';
comment on column public.dm_participants.archived_at is
  'When set, conversation appears in Archived inbox only.';
comment on column public.dm_participants.hidden_at is
  'When set, conversation is hidden from inbox until explicitly reopened.';
comment on column public.dm_participants.cleared_at is
  'Messages at or before this time are hidden for this participant.';

-- ---------------------------------------------------------------------------
-- Per-user hidden messages
-- ---------------------------------------------------------------------------

create table if not exists public.dm_message_hides (
  message_id uuid not null references public.dm_messages (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  hidden_at timestamptz not null default now(),
  primary key (message_id, profile_id)
);

alter table public.dm_message_hides enable row level security;

create policy dm_message_hides_select_own
  on public.dm_message_hides for select
  using (profile_id = auth.uid());

create policy dm_message_hides_insert_own
  on public.dm_message_hides for insert
  with check (profile_id = auth.uid());

create policy dm_message_hides_delete_own
  on public.dm_message_hides for delete
  using (profile_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.is_dm_muted_for_user(p_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.dm_participants p
    where p.conversation_id = p_conversation_id
      and p.profile_id = auth.uid()
      and p.muted_at is not null
  );
$$;

revoke all on function public.is_dm_muted_for_user(uuid) from public;
grant execute on function public.is_dm_muted_for_user(uuid) to authenticated;

create or replace function public.is_dm_hidden_for_user(p_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.dm_participants p
    where p.conversation_id = p_conversation_id
      and p.profile_id = auth.uid()
      and p.hidden_at is not null
  );
$$;

revoke all on function public.is_dm_hidden_for_user(uuid) from public;
grant execute on function public.is_dm_hidden_for_user(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- list_dm_inbox — per-user visible last message; archive filter
-- ---------------------------------------------------------------------------

drop function if exists public.list_dm_inbox();

create or replace function public.list_dm_inbox(p_archived boolean default false)
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
  messaging_blocked boolean,
  muted boolean,
  archived boolean
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
    last_msg.body as last_message_body,
    last_msg.sender_id as last_message_sender_id,
    last_msg.created_at as last_message_at,
    mine.last_read_at as my_last_read_at,
    c.updated_at as conversation_updated_at,
    public.members_are_blocked(auth.uid(), other_p.id) as messaging_blocked,
    (mine.muted_at is not null) as muted,
    (mine.archived_at is not null) as archived
  from public.dm_participants mine
  join public.dm_conversations c
    on c.id = mine.conversation_id
  join public.dm_participants other_part
    on other_part.conversation_id = c.id
   and other_part.profile_id <> mine.profile_id
  join public.profiles other_p
    on other_p.id = other_part.profile_id
  left join lateral (
    select m.body, m.sender_id, m.created_at
    from public.dm_messages m
    where m.conversation_id = c.id
      and m.created_at > coalesce(mine.cleared_at, '-infinity'::timestamptz)
      and not exists (
        select 1
        from public.dm_message_hides h
        where h.message_id = m.id
          and h.profile_id = auth.uid()
      )
    order by m.created_at desc
    limit 1
  ) last_msg on true
  where mine.profile_id = auth.uid()
    and mine.hidden_at is null
    and (
      (p_archived = false and mine.archived_at is null)
      or (p_archived = true and mine.archived_at is not null)
    )
  order by coalesce(last_msg.created_at, c.updated_at) desc;
$$;

revoke all on function public.list_dm_inbox(boolean) from public;
grant execute on function public.list_dm_inbox(boolean) to authenticated;

-- ---------------------------------------------------------------------------
-- get_dm_unread_count — skip muted, archived, hidden
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
  left join lateral (
    select m.sender_id, m.created_at
    from public.dm_messages m
    where m.conversation_id = c.id
      and m.created_at > coalesce(mine.cleared_at, '-infinity'::timestamptz)
      and not exists (
        select 1
        from public.dm_message_hides h
        where h.message_id = m.id
          and h.profile_id = auth.uid()
      )
    order by m.created_at desc
    limit 1
  ) last_msg on true
  where mine.profile_id = auth.uid()
    and mine.hidden_at is null
    and mine.archived_at is null
    and mine.muted_at is null
    and last_msg.created_at is not null
    and last_msg.sender_id is distinct from auth.uid()
    and (
      mine.last_read_at is null
      or last_msg.created_at > mine.last_read_at
    );
$$;

revoke all on function public.get_dm_unread_count() from public;
grant execute on function public.get_dm_unread_count() to authenticated;

create or replace function public.get_dm_archived_count()
returns int
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int
  from public.dm_participants mine
  where mine.profile_id = auth.uid()
    and mine.hidden_at is null
    and mine.archived_at is not null;
$$;

revoke all on function public.get_dm_archived_count() from public;
grant execute on function public.get_dm_archived_count() to authenticated;

-- ---------------------------------------------------------------------------
-- get_dm_thread — respect cleared_at and message hides
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
    select
      m.id,
      m.sender_id,
      m.body,
      m.created_at,
      m.job_id,
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
      rj.created_at as reply_job_created_at,
      rm.shared_profile_id as reply_shared_profile_id,
      rsp.full_name as reply_shared_profile_name,
      rsp.title as reply_shared_profile_title,
      rsp.avatar_url as reply_shared_profile_avatar_url,
      rm.member_share_snapshot as reply_member_share_snapshot
    from public.dm_messages m
    left join public.job_postings j on j.id = m.job_id
    left join public.profiles sp on sp.id = m.shared_profile_id
    left join public.dm_messages rm on rm.id = m.reply_to_message_id
    left join public.profiles rp on rp.id = rm.sender_id
    left join public.job_postings rj on rj.id = rm.job_id
    left join public.profiles rsp on rsp.id = rm.shared_profile_id
    where m.conversation_id = p_conversation_id
      and (p_before is null or m.created_at < p_before)
      and m.created_at > coalesce(
        (
          select p.cleared_at
          from public.dm_participants p
          where p.conversation_id = p_conversation_id
            and p.profile_id = current_id
        ),
        '-infinity'::timestamptz
      )
      and not exists (
        select 1
        from public.dm_message_hides h
        where h.message_id = m.id
          and h.profile_id = current_id
      )
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
            'body', t.body,
            'created_at', t.created_at,
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
            'reply_shared_profile_id', t.reply_shared_profile_id,
            'reply_shared_profile_name', t.reply_shared_profile_name,
            'reply_shared_profile_title', t.reply_shared_profile_title,
            'reply_shared_profile_avatar_url', t.reply_shared_profile_avatar_url,
            'reply_member_share_snapshot', t.reply_member_share_snapshot,
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
                  from public.dm_message_reactions r
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
                  from public.dm_message_reactions r
                  join public.profiles pr on pr.id = r.profile_id
                  where r.message_id = t.id
                    and r.target = 'attachment'
                  group by r.emoji
                ) agg
              ),
              '[]'::jsonb
            )
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
-- Triggers: unarchive on new message; skip notifications when muted/hidden
-- ---------------------------------------------------------------------------

create or replace function public.dm_messages_clear_archive_on_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.dm_participants
  set archived_at = null
  where conversation_id = new.conversation_id
    and archived_at is not null;
  return new;
end;
$$;

drop trigger if exists dm_messages_clear_archive on public.dm_messages;

create trigger dm_messages_clear_archive
  after insert on public.dm_messages
  for each row
  execute function public.dm_messages_clear_archive_on_insert();

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
  recipient_muted boolean;
  recipient_hidden boolean;
begin
  select p.profile_id
  into recipient_id
  from public.dm_participants p
  where p.conversation_id = new.conversation_id
    and p.profile_id is distinct from new.sender_id
  limit 1;

  if recipient_id is null then
    return new;
  end if;

  select
    (p.muted_at is not null),
    (p.hidden_at is not null)
  into recipient_muted, recipient_hidden
  from public.dm_participants p
  where p.conversation_id = new.conversation_id
    and p.profile_id = recipient_id;

  if recipient_muted or recipient_hidden then
    return new;
  end if;

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

-- =============================================================================
