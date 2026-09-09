-- =============================================================================
-- Migration: message_reaction_targets
--
-- Adds reaction target (body vs attachment) so card and text in share messages
-- can be reacted to independently. Updates get_dm_thread / get_room_thread.
-- Run manually in Supabase SQL Editor.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- dm_message_reactions — add target column + composite PK
-- ---------------------------------------------------------------------------

alter table public.dm_message_reactions
  add column target text not null default 'body'
  check (target in ('body', 'attachment'));

update public.dm_message_reactions r
set target = 'attachment'
from public.dm_messages m
where r.message_id = m.id
  and (
    m.job_id is not null
    or m.shared_profile_id is not null
    or m.member_share_snapshot is not null
  )
  and trim(coalesce(m.body, '')) = '';

alter table public.dm_message_reactions
  drop constraint dm_message_reactions_pkey;

alter table public.dm_message_reactions
  add primary key (message_id, profile_id, target);

comment on column public.dm_message_reactions.target is
  'Reaction surface: body (text bubble) or attachment (job/member share card).';

-- ---------------------------------------------------------------------------
-- room_message_reactions — add target column + composite PK
-- ---------------------------------------------------------------------------

alter table public.room_message_reactions
  add column target text not null default 'body'
  check (target in ('body', 'attachment'));

update public.room_message_reactions r
set target = 'attachment'
from public.room_messages m
where r.message_id = m.id
  and (
    m.job_id is not null
    or m.shared_profile_id is not null
    or m.member_share_snapshot is not null
  )
  and trim(coalesce(m.body, '')) = '';

alter table public.room_message_reactions
  drop constraint room_message_reactions_pkey;

alter table public.room_message_reactions
  add primary key (message_id, profile_id, target);

comment on column public.room_message_reactions.target is
  'Reaction surface: body (text bubble) or attachment (job/member share card).';

-- ---------------------------------------------------------------------------
-- get_dm_thread — split reactions by target
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
-- get_room_thread — split reactions by target
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
            'sender_name', t.sender_name,
            'sender_avatar_url', t.sender_avatar_url,
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
          order by t.created_at asc
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
