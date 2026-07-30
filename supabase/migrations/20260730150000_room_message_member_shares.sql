-- =============================================================================
-- Migration: room_message_member_shares
--
-- Adds optional shared_profile_id and member_share_snapshot to room_messages
-- for rich member share embeds in community rooms.
-- Run manually in Supabase SQL Editor.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- shared_profile_id + member_share_snapshot columns
-- ---------------------------------------------------------------------------

alter table public.room_messages
  add column if not exists shared_profile_id uuid references public.profiles (id) on delete set null;

alter table public.room_messages
  add column if not exists member_share_snapshot jsonb;

create index if not exists room_messages_shared_profile_id_idx
  on public.room_messages (shared_profile_id)
  where shared_profile_id is not null;

create index if not exists room_messages_member_share_snapshot_idx
  on public.room_messages ((member_share_snapshot is not null))
  where member_share_snapshot is not null;

-- Relax body constraint: text OR job OR member attachment required
alter table public.room_messages
  drop constraint if exists room_messages_body_check;

alter table public.room_messages
  add constraint room_messages_body_check
  check (
    char_length(trim(body)) > 0
    or job_id is not null
    or shared_profile_id is not null
    or member_share_snapshot is not null
  );

-- ---------------------------------------------------------------------------
-- get_room_thread — include member share payload
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
      rj.engagement::text as reply_job_engagement
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

-- ---------------------------------------------------------------------------
-- list_rooms_for_user — member share preview in room list
-- ---------------------------------------------------------------------------

create or replace function public.list_rooms_for_user()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  current_id uuid := auth.uid();
  result jsonb;
begin
  if current_id is null then
    raise exception 'Not authenticated';
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id', r.id,
        'name', r.name,
        'slug', r.slug,
        'description', r.description,
        'icon', r.icon,
        'is_default', r.is_default,
        'sort_order', r.sort_order,
        'joined', (m.profile_id is not null),
        'last_read_at', m.last_read_at,
        'last_message_body', public.message_preview_body(
          lm.body,
          lm.job_id,
          lm.shared_profile_id,
          lm.member_share_snapshot
        ),
        'last_message_at', lm.created_at,
        'last_message_sender_id', lm.sender_id,
        'unread_count', case
          when m.profile_id is null then 0
          else coalesce(
            (
              select count(*)::int
              from public.room_messages rm
              where rm.room_id = r.id
                and (m.last_read_at is null or rm.created_at > m.last_read_at)
            ),
            0
          )
        end
      )
      order by
        case when r.is_default and m.profile_id is not null then 0
             when m.profile_id is not null then 1
             else 2
        end,
        case when m.profile_id is not null then coalesce(lm.created_at, r.created_at) end desc nulls last,
        r.sort_order asc
    ),
    '[]'::jsonb
  )
  into result
  from public.community_rooms r
  left join public.room_memberships m
    on m.room_id = r.id and m.profile_id = current_id
  left join lateral (
    select
      rm.body,
      rm.created_at,
      rm.sender_id,
      rm.job_id,
      rm.shared_profile_id,
      rm.member_share_snapshot
    from public.room_messages rm
    where rm.room_id = r.id
    order by rm.created_at desc
    limit 1
  ) lm on true
  where r.is_archived = false;

  return result;
end;
$$;

revoke all on function public.list_rooms_for_user() from public;
grant execute on function public.list_rooms_for_user() to authenticated;

-- =============================================================================
