-- =============================================================================
-- Migration: message_member_shares
--
-- Adds optional shared_profile_id to DM messages for rich member share embeds.
-- Run manually in Supabase SQL Editor.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Helper: preview text for attachment-only shares
-- ---------------------------------------------------------------------------

create or replace function public.message_preview_body(
  p_body text,
  p_job_id uuid,
  p_shared_profile_id uuid default null
)
returns text
language sql
stable
set search_path = public
as $$
  select case
    when p_job_id is not null and char_length(trim(coalesce(p_body, ''))) = 0 then
      'Shared a job · ' || coalesce(
        (select j.role from public.job_postings j where j.id = p_job_id),
        'Job'
      )
    when p_shared_profile_id is not null and char_length(trim(coalesce(p_body, ''))) = 0 then
      'Shared a member · ' || coalesce(
        (select p.full_name from public.profiles p where p.id = p_shared_profile_id),
        'Member'
      )
    else coalesce(p_body, '')
  end;
$$;

-- ---------------------------------------------------------------------------
-- shared_profile_id column (DM messages only)
-- ---------------------------------------------------------------------------

alter table public.dm_messages
  add column if not exists shared_profile_id uuid references public.profiles (id) on delete set null;

create index if not exists dm_messages_shared_profile_id_idx
  on public.dm_messages (shared_profile_id)
  where shared_profile_id is not null;

-- Relax body constraint: text OR job OR member attachment required
alter table public.dm_messages
  drop constraint if exists dm_messages_body_check;

alter table public.dm_messages
  add constraint dm_messages_body_check
  check (
    char_length(trim(body)) > 0
    or job_id is not null
    or shared_profile_id is not null
  );

-- ---------------------------------------------------------------------------
-- DM inbox preview on new messages
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
    last_message_body = public.message_preview_body(
      new.body,
      new.job_id,
      new.shared_profile_id
    ),
    last_message_sender_id = new.sender_id,
    last_message_at = new.created_at
  where id = new.conversation_id;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- get_dm_thread — include member share payload
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
      m.shared_profile_id,
      sp.full_name as shared_profile_name,
      sp.title as shared_profile_title,
      sp.avatar_url as shared_profile_avatar_url
    from public.dm_messages m
    left join public.job_postings j on j.id = m.job_id
    left join public.profiles sp on sp.id = m.shared_profile_id
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
            'shared_profile_id', t.shared_profile_id,
            'shared_profile_name', t.shared_profile_name,
            'shared_profile_title', t.shared_profile_title,
            'shared_profile_avatar_url', t.shared_profile_avatar_url,
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
-- list_rooms_for_user — pass null shared_profile_id to preview helper
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
        'last_message_body', public.message_preview_body(lm.body, lm.job_id, null),
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
    select rm.body, rm.created_at, rm.sender_id, rm.job_id
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
