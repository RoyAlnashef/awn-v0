-- =============================================================================
-- Migration: create_room_tables
--
-- IMPORTANT: Run this manually in the Supabase SQL Editor.
-- Agents must NEVER execute this against the project (no db push, no MCP SQL).
-- Paste the full contents of this file into the Dashboard → SQL Editor → Run.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Community rooms catalog
-- ---------------------------------------------------------------------------

create table public.community_rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) > 0),
  slug text not null unique check (char_length(trim(slug)) > 0),
  description text not null default '',
  icon text not null default 'hash',
  is_default boolean not null default false,
  is_archived boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index community_rooms_slug_idx on public.community_rooms (slug);
create index community_rooms_sort_order_idx on public.community_rooms (sort_order);

comment on table public.community_rooms is
  'Discipline-specific community channels. is_default rooms are auto-joined on member approval.';

-- ---------------------------------------------------------------------------
-- Room memberships (who has joined which room)
-- ---------------------------------------------------------------------------

create table public.room_memberships (
  room_id uuid not null references public.community_rooms (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  last_read_at timestamptz,
  primary key (room_id, profile_id)
);

create index room_memberships_profile_id_idx on public.room_memberships (profile_id);
create index room_memberships_room_id_idx on public.room_memberships (room_id);

comment on table public.room_memberships is
  'Tracks which profiles have joined each community room, and their read position.';

-- ---------------------------------------------------------------------------
-- Room messages
-- ---------------------------------------------------------------------------

create table public.room_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.community_rooms (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(trim(body)) > 0),
  created_at timestamptz not null default now()
);

create index room_messages_room_created_idx
  on public.room_messages (room_id, created_at desc);

comment on table public.room_messages is
  'Messages posted inside community rooms.';

-- ---------------------------------------------------------------------------
-- Room message reactions (one reaction per user per message)
-- ---------------------------------------------------------------------------

create table public.room_message_reactions (
  message_id uuid not null references public.room_messages (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  emoji text not null check (char_length(emoji) between 1 and 8),
  created_at timestamptz not null default now(),
  primary key (message_id, profile_id)
);

create index room_message_reactions_message_id_idx
  on public.room_message_reactions (message_id);

comment on table public.room_message_reactions is
  'Emoji reactions on room messages — one reaction per participant per message.';

-- ---------------------------------------------------------------------------
-- updated_at trigger for community_rooms
-- ---------------------------------------------------------------------------

create or replace function public.set_community_rooms_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger community_rooms_set_updated_at
  before update on public.community_rooms
  for each row
  execute function public.set_community_rooms_updated_at();

-- ---------------------------------------------------------------------------
-- Auto-join trigger: when a profile becomes active, join all default rooms
-- ---------------------------------------------------------------------------

create or replace function public.auto_join_default_rooms()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Only fire when status transitions to 'active'
  if new.status = 'active' and (old.status is null or old.status <> 'active') then
    insert into public.room_memberships (room_id, profile_id)
    select r.id, new.id
    from public.community_rooms r
    where r.is_default = true
      and r.is_archived = false
    on conflict (room_id, profile_id) do nothing;
  end if;
  return new;
end;
$$;

create trigger profiles_auto_join_rooms
  after update of status on public.profiles
  for each row
  execute function public.auto_join_default_rooms();

-- ---------------------------------------------------------------------------
-- RLS helpers
-- ---------------------------------------------------------------------------

create or replace function public.is_room_member(p_room_id uuid)
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
  );
$$;

revoke all on function public.is_room_member(uuid) from public;
grant execute on function public.is_room_member(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.community_rooms enable row level security;
alter table public.room_memberships enable row level security;
alter table public.room_messages enable row level security;
alter table public.room_message_reactions enable row level security;

-- Rooms: any authenticated user can see non-archived rooms
create policy "community_rooms_select_authenticated"
  on public.community_rooms
  for select
  to authenticated
  using (is_archived = false);

-- Rooms: only owner/admin can insert or update
create policy "community_rooms_insert_admin"
  on public.community_rooms
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role in ('owner', 'admin')
        and p.status = 'active'
    )
  );

create policy "community_rooms_update_admin"
  on public.community_rooms
  for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role in ('owner', 'admin')
        and p.status = 'active'
    )
  );

-- Memberships: members can see all memberships for their rooms
create policy "room_memberships_select_authenticated"
  on public.room_memberships
  for select
  to authenticated
  using (true);

-- Memberships: users can join (insert own) or leave (delete own)
create policy "room_memberships_insert_self"
  on public.room_memberships
  for insert
  to authenticated
  with check (profile_id = auth.uid());

create policy "room_memberships_delete_self"
  on public.room_memberships
  for delete
  to authenticated
  using (profile_id = auth.uid());

-- Memberships: user can update own last_read_at
create policy "room_memberships_update_own_read"
  on public.room_memberships
  for update
  to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- Messages: any authenticated user can read (enables non-member preview)
create policy "room_messages_select_authenticated"
  on public.room_messages
  for select
  to authenticated
  using (true);

-- Messages: only members can send
create policy "room_messages_insert_member"
  on public.room_messages
  for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and public.is_room_member(room_id)
  );

-- Reactions: any authenticated user can read
create policy "room_message_reactions_select_authenticated"
  on public.room_message_reactions
  for select
  to authenticated
  using (true);

-- Reactions: only members of the room can add/change/remove reactions
create policy "room_message_reactions_insert_member"
  on public.room_message_reactions
  for insert
  to authenticated
  with check (
    profile_id = auth.uid()
    and exists (
      select 1 from public.room_messages m
      where m.id = message_id
        and public.is_room_member(m.room_id)
    )
  );

create policy "room_message_reactions_update_own"
  on public.room_message_reactions
  for update
  to authenticated
  using (profile_id = auth.uid())
  with check (
    profile_id = auth.uid()
    and exists (
      select 1 from public.room_messages m
      where m.id = message_id
        and public.is_room_member(m.room_id)
    )
  );

create policy "room_message_reactions_delete_own"
  on public.room_message_reactions
  for delete
  to authenticated
  using (
    profile_id = auth.uid()
    and exists (
      select 1 from public.room_messages m
      where m.id = message_id
        and public.is_room_member(m.room_id)
    )
  );

-- ---------------------------------------------------------------------------
-- RPCs
-- ---------------------------------------------------------------------------

-- List all rooms with membership status + unread count + last message preview
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
        'last_message_body', lm.body,
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
        -- General / default rooms first, then joined by last message activity, then unjoined by sort_order
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
    select rm.body, rm.created_at, rm.sender_id
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

-- Get paginated messages for a room with reactions
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

  -- Verify room exists and is not archived
  if not exists (
    select 1 from public.community_rooms r
    where r.id = p_room_id and r.is_archived = false
  ) then
    raise exception 'Room not found';
  end if;

  with page as (
    select m.id, m.sender_id, m.body, m.created_at,
           p.full_name as sender_name, p.avatar_url as sender_avatar_url
    from public.room_messages m
    join public.profiles p on p.id = m.sender_id
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

-- Total unread message count across all joined rooms
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
    and r.is_archived = false;

  return total;
end;
$$;

revoke all on function public.get_rooms_unread_count() from public;
grant execute on function public.get_rooms_unread_count() to authenticated;

-- Get member count per room (used by admin Groups page)
create or replace function public.get_room_member_counts()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  current_id uuid := auth.uid();
begin
  if current_id is null then
    raise exception 'Not authenticated';
  end if;

  -- Verify admin
  if not exists (
    select 1 from public.profiles p
    where p.id = current_id
      and p.role in ('owner', 'admin')
      and p.status = 'active'
  ) then
    raise exception 'Forbidden';
  end if;

  return (
    select coalesce(
      jsonb_object_agg(
        m.room_id::text,
        m.cnt
      ),
      '{}'::jsonb
    )
    from (
      select room_id, count(*)::int as cnt
      from public.room_memberships
      group by room_id
    ) m
  );
end;
$$;

revoke all on function public.get_room_member_counts() from public;
grant execute on function public.get_room_member_counts() to authenticated;

-- ---------------------------------------------------------------------------
-- Realtime
-- ---------------------------------------------------------------------------

alter publication supabase_realtime add table public.room_messages;
alter publication supabase_realtime add table public.room_message_reactions;

-- ---------------------------------------------------------------------------
-- Seed: 14 default community rooms
-- ---------------------------------------------------------------------------

insert into public.community_rooms (name, slug, description, icon, is_default, sort_order) values
  ('General',             'general',            'The main AWN channel — introductions and announcements.',    'hash',          true,  1),
  ('Musicians',           'musicians',           'Musical directors · Session musicians · Deps.',              'music',         false, 2),
  ('Assistants',          'assistants',          'Personal assistants to musicians and management.',           'hand-helping',  false, 3),
  ('Audio',               'audio',               'FOH · Monitors · RF · Systems engineering.',                 'speaker',       false, 4),
  ('Backline & Stage',    'backline-stage',      'Guitar · Bass · Drum · Keys · Riggers.',                    'guitar',        false, 5),
  ('Help Needed',         'help-needed',         'Need something? Post here for last-minute cover.',           'life-buoy',     false, 6),
  ('Lighting & Video',    'lighting-video',      'LDs · Programmers · LED · IMAG.',                           'lightbulb',     false, 7),
  ('Mental Health',       'mental-health',       'Road life is hard. Talk about it here.',                    'brain',         false, 8),
  ('Parents on the Road', 'parents-on-the-road', 'Balancing touring and family life.',                        'baby',          false, 9),
  ('Photo & Content',     'photo-content',       'Tour photographers · Videographers · Editors.',             'camera',        false, 10),
  ('Production',          'production',          'Tour managers · Production managers · Coordinators.',       'clipboard-list',false, 11),
  ('Road Life',           'road-life',           'The daily reality of being on the road.',                   'truck',         false, 12),
  ('Touring Life',        'touring-life',        'Road life, routes, venues, and travel tips.',               'route',         false, 13),
  ('Women of the Industry','women-of-the-industry','A space for women working in live touring.',              'sparkles',      false, 14);

-- =============================================================================
