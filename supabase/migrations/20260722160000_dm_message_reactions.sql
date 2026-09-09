-- =============================================================================
-- Migration: dm_message_reactions
--
-- Run manually in Supabase SQL Editor after prior DM migrations.
-- Adds emoji reactions on direct messages + extends get_dm_thread RPC.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Reactions table (one reaction per user per message)
-- ---------------------------------------------------------------------------

create table public.dm_message_reactions (
  message_id uuid not null references public.dm_messages (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  emoji text not null check (char_length(emoji) between 1 and 8),
  created_at timestamptz not null default now(),
  primary key (message_id, profile_id)
);

create index dm_message_reactions_message_id_idx
  on public.dm_message_reactions (message_id);

comment on table public.dm_message_reactions is
  'Emoji reactions on direct messages — one reaction per participant per message.';

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.dm_message_reactions enable row level security;

create policy "dm_message_reactions_select_participant"
  on public.dm_message_reactions
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.dm_messages m
      where m.id = message_id
        and public.is_dm_participant(m.conversation_id)
    )
  );

create policy "dm_message_reactions_insert_own"
  on public.dm_message_reactions
  for insert
  to authenticated
  with check (
    profile_id = auth.uid()
    and exists (
      select 1
      from public.dm_messages m
      where m.id = message_id
        and public.is_dm_participant(m.conversation_id)
    )
  );

create policy "dm_message_reactions_update_own"
  on public.dm_message_reactions
  for update
  to authenticated
  using (profile_id = auth.uid())
  with check (
    profile_id = auth.uid()
    and exists (
      select 1
      from public.dm_messages m
      where m.id = message_id
        and public.is_dm_participant(m.conversation_id)
    )
  );

create policy "dm_message_reactions_delete_own"
  on public.dm_message_reactions
  for delete
  to authenticated
  using (
    profile_id = auth.uid()
    and exists (
      select 1
      from public.dm_messages m
      where m.id = message_id
        and public.is_dm_participant(m.conversation_id)
    )
  );

-- ---------------------------------------------------------------------------
-- Realtime
-- ---------------------------------------------------------------------------

alter publication supabase_realtime add table public.dm_message_reactions;

-- ---------------------------------------------------------------------------
-- Thread page: include reactions per message
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
    select m.id, m.sender_id, m.body, m.created_at
    from public.dm_messages m
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

-- =============================================================================
