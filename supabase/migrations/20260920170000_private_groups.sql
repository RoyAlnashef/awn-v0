-- =============================================================================
-- Migration: private_groups
--
-- IMPORTANT: Run this manually in the Supabase SQL Editor.
-- Agents must NEVER execute this against the project (no db push, no MCP SQL).
-- Paste the full contents of this file into the Dashboard → SQL Editor → Run.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Private group columns on community_rooms
-- ---------------------------------------------------------------------------

alter table public.community_rooms
  add column if not exists is_private boolean not null default false,
  add column if not exists private_note text not null default '';

comment on column public.community_rooms.is_private is
  'When true, members must request admin approval before joining.';

comment on column public.community_rooms.private_note is
  'Admin note shown to non-members in the private group hidden state.';

alter table public.community_rooms
  drop constraint if exists community_rooms_private_not_default;

alter table public.community_rooms
  add constraint community_rooms_private_not_default
  check (not (is_private and is_default));

-- ---------------------------------------------------------------------------
-- Join requests for private groups
-- ---------------------------------------------------------------------------

create table if not exists public.room_join_requests (
  room_id uuid not null references public.community_rooms (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  requested_at timestamptz not null default now(),
  primary key (room_id, profile_id)
);

create index if not exists room_join_requests_room_id_idx
  on public.room_join_requests (room_id);

create index if not exists room_join_requests_profile_id_idx
  on public.room_join_requests (profile_id);

comment on table public.room_join_requests is
  'Pending join requests for private community rooms.';

alter table public.room_join_requests enable row level security;

create policy "room_join_requests_select_self_or_admin"
  on public.room_join_requests
  for select
  to authenticated
  using (profile_id = auth.uid() or public.is_admin());

create policy "room_join_requests_insert_self_private"
  on public.room_join_requests
  for insert
  to authenticated
  with check (
    profile_id = auth.uid()
    and exists (
      select 1
      from public.community_rooms r
      where r.id = room_id
        and r.is_private = true
        and r.is_archived = false
    )
    and not public.is_room_member(room_id)
  );

create policy "room_join_requests_delete_self_or_admin"
  on public.room_join_requests
  for delete
  to authenticated
  using (profile_id = auth.uid() or public.is_admin());

-- ---------------------------------------------------------------------------
-- Membership policies — block direct join on private rooms; allow admin remove
-- ---------------------------------------------------------------------------

drop policy if exists "room_memberships_insert_self" on public.room_memberships;

create policy "room_memberships_insert_self"
  on public.room_memberships
  for insert
  to authenticated
  with check (
    profile_id = auth.uid()
    and (
      not exists (
        select 1
        from public.community_rooms r
        where r.id = room_id
          and r.is_private = true
      )
      or public.is_admin()
    )
  );

create policy "room_memberships_delete_admin"
  on public.room_memberships
  for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Message visibility — private rooms require membership
-- ---------------------------------------------------------------------------

drop policy if exists "room_messages_select_authenticated" on public.room_messages;

create policy "room_messages_select_authenticated"
  on public.room_messages
  for select
  to authenticated
  using (
    not exists (
      select 1
      from public.community_rooms r
      where r.id = room_id
        and r.is_private = true
    )
    or public.is_room_member(room_id)
    or public.is_admin()
  );

-- ---------------------------------------------------------------------------
-- Auto-join — skip private rooms
-- ---------------------------------------------------------------------------

create or replace function public.auto_join_default_rooms()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'active' and (old.status is null or old.status <> 'active') then
    insert into public.room_memberships (room_id, profile_id)
    select r.id, new.id
    from public.community_rooms r
    where r.is_default = true
      and r.is_archived = false
      and r.is_private = false
    on conflict (room_id, profile_id) do nothing;
  end if;
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- list_rooms_for_user — private fields + hide preview for non-members
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
        'is_private', r.is_private,
        'private_note', case
          when r.is_private and m.profile_id is null then r.private_note
          else ''
        end,
        'join_request_pending', (
          r.is_private
          and m.profile_id is null
          and exists (
            select 1
            from public.room_join_requests j
            where j.room_id = r.id
              and j.profile_id = current_id
          )
        ),
        'sort_order', r.sort_order,
        'joined', (m.profile_id is not null),
        'muted', (m.muted_at is not null),
        'last_read_at', m.last_read_at,
        'last_message_body', case
          when r.is_private and m.profile_id is null then null
          else public.message_preview_body(
            lm.body,
            lm.job_id,
            lm.shared_profile_id,
            lm.member_share_snapshot
          )
        end,
        'last_message_at', case
          when r.is_private and m.profile_id is null then null
          else lm.created_at
        end,
        'last_message_sender_id', case
          when r.is_private and m.profile_id is null then null
          else lm.sender_id
        end,
        'unread_count', case
          when m.profile_id is null then 0
          when m.muted_at is not null then 0
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

-- ---------------------------------------------------------------------------
-- get_room_join_request_counts — admin pending counts per room
-- ---------------------------------------------------------------------------

create or replace function public.get_room_join_request_counts()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not public.is_admin() then
    raise exception 'Forbidden';
  end if;

  return (
    select coalesce(
      jsonb_object_agg(j.room_id::text, j.cnt),
      '{}'::jsonb
    )
    from (
      select room_id, count(*)::int as cnt
      from public.room_join_requests
      group by room_id
    ) j
  );
end;
$$;

revoke all on function public.get_room_join_request_counts() from public;
grant execute on function public.get_room_join_request_counts() to authenticated;

-- ---------------------------------------------------------------------------
-- get_room_admin_member_summary — members + pending for admin drawer
-- ---------------------------------------------------------------------------

create or replace function public.get_room_admin_member_summary(p_room_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not public.is_admin() then
    raise exception 'Forbidden';
  end if;

  return jsonb_build_object(
    'members', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', p.id,
            'name', coalesce(p.full_name, 'Member'),
            'avatar_url', p.avatar_url,
            'joined_at', m.joined_at
          )
          order by m.joined_at asc
        )
        from public.room_memberships m
        join public.profiles p on p.id = m.profile_id
        where m.room_id = p_room_id
      ),
      '[]'::jsonb
    ),
    'pending', coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'id', p.id,
            'name', coalesce(p.full_name, 'Member'),
            'avatar_url', p.avatar_url,
            'requested_at', j.requested_at
          )
          order by j.requested_at asc
        )
        from public.room_join_requests j
        join public.profiles p on p.id = j.profile_id
        where j.room_id = p_room_id
      ),
      '[]'::jsonb
    )
  );
end;
$$;

revoke all on function public.get_room_admin_member_summary(uuid) from public;
grant execute on function public.get_room_admin_member_summary(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- get_room_thread — block private room access for non-members
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

  if exists (
    select 1
    from public.community_rooms r
    where r.id = p_room_id
      and r.is_private = true
  )
  and not public.is_room_member(p_room_id)
  and not public.is_admin() then
    return jsonb_build_object('messages', '[]'::jsonb, 'has_more', false);
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
