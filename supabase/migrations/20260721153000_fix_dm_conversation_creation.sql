-- =============================================================================
-- Migration: fix_dm_conversation_creation
--
-- Run manually in Supabase SQL Editor after create_dm_tables.
-- Fixes RLS chicken-and-egg: conversation insert + select failed before
-- participants existed, causing client-side fallback to local-only threads.
-- =============================================================================

create or replace function public.get_or_create_dm_conversation(other_profile_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_id uuid := auth.uid();
  conv_id uuid;
  pair_a uuid;
  pair_b uuid;
begin
  if current_id is null then
    raise exception 'Not authenticated';
  end if;

  if other_profile_id = current_id then
    raise exception 'Cannot message yourself';
  end if;

  pair_a := least(current_id, other_profile_id);
  pair_b := greatest(current_id, other_profile_id);

  select cp.conversation_id
  into conv_id
  from public.dm_conversation_pairs cp
  where cp.profile_a = pair_a
    and cp.profile_b = pair_b;

  if conv_id is not null then
    return conv_id;
  end if;

  insert into public.dm_conversations default values
  returning id into conv_id;

  insert into public.dm_participants (conversation_id, profile_id)
  values
    (conv_id, current_id),
    (conv_id, other_profile_id);

  insert into public.dm_conversation_pairs (profile_a, profile_b, conversation_id)
  values (pair_a, pair_b, conv_id);

  return conv_id;
end;
$$;

revoke all on function public.get_or_create_dm_conversation(uuid) from public;
grant execute on function public.get_or_create_dm_conversation(uuid) to authenticated;

-- =============================================================================
