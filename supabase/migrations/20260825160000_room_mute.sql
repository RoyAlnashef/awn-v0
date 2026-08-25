-- =============================================================================
-- Migration: room_mute
--
-- IMPORTANT: Run this manually in the Supabase SQL Editor.
-- Agents must NEVER execute this against the project (no db push, no MCP SQL).
-- Paste the full contents of this file into the Dashboard → SQL Editor → Run.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Mute state on room memberships
-- ---------------------------------------------------------------------------

alter table public.room_memberships
  add column if not exists muted_at timestamptz;

comment on column public.room_memberships.muted_at is
  'When set, the member has muted this room (suppresses unread badges and future push).';

-- Existing room_memberships_update_own_read policy allows users to update their own row.

-- ---------------------------------------------------------------------------
-- Helper: check if current user has muted a room (for push notification filtering)
-- ---------------------------------------------------------------------------

create or replace function public.is_room_muted_for_user(p_room_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.room_memberships m
    where m.room_id = p_room_id
      and m.profile_id = auth.uid()
      and m.muted_at is not null
  );
$$;

revoke all on function public.is_room_muted_for_user(uuid) from public;
grant execute on function public.is_room_muted_for_user(uuid) to authenticated;

comment on function public.is_room_muted_for_user(uuid) is
  'Returns true when the authenticated user has muted the given room.';

-- ---------------------------------------------------------------------------
-- list_rooms_for_user — include muted flag; suppress unread when muted
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
        'muted', (m.muted_at is not null),
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
-- get_rooms_unread_count — exclude muted memberships
-- ---------------------------------------------------------------------------

create or replace function public.get_rooms_unread_count()
returns int
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  current_id uuid := auth.uid();
  total int;
begin
  if current_id is null then
    return 0;
  end if;

  select coalesce(sum(
    (
      select count(*)::int
      from public.room_messages rm
      where rm.room_id = m.room_id
        and (m.last_read_at is null or rm.created_at > m.last_read_at)
    )
  ), 0)::int
  into total
  from public.room_memberships m
  join public.community_rooms r on r.id = m.room_id
  where m.profile_id = current_id
    and m.muted_at is null
    and r.is_archived = false;

  return total;
end;
$$;

revoke all on function public.get_rooms_unread_count() from public;
grant execute on function public.get_rooms_unread_count() to authenticated;

-- =============================================================================
