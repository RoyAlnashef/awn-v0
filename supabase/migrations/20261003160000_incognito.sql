-- =============================================================================
-- Migration: incognito
--
-- Run manually in Supabase SQL Editor.
-- Lets members hide from discovery (People, map, new-message search, public
-- profile) while remaining visible in existing DMs and group rooms.
-- =============================================================================

alter table public.profiles
  add column if not exists incognito boolean not null default false;

comment on column public.profiles.incognito is
  'When true, member is hidden from discovery surfaces; existing DM/room contacts may still see them.';

-- ---------------------------------------------------------------------------
-- Toggle incognito for the current user (also appear offline + clear check-in)
-- ---------------------------------------------------------------------------

create or replace function public.set_incognito(p_enabled boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    return;
  end if;

  update public.profiles
  set
    incognito = p_enabled,
    appear_offline = case when p_enabled then true else appear_offline end
  where id = auth.uid();

  if p_enabled then
    delete from public.check_ins
    where profile_id = auth.uid();
  end if;
end;
$$;

revoke all on function public.set_incognito(boolean) from public;
grant execute on function public.set_incognito(boolean) to authenticated;

-- ---------------------------------------------------------------------------
-- Check-ins: do not expose fresh locations for incognito members (except own)
-- ---------------------------------------------------------------------------

drop policy if exists "check_ins_select_fresh" on public.check_ins;

create policy "check_ins_select_fresh"
  on public.check_ins
  for select
  to authenticated
  using (
    checked_in_at > now() - interval '24 hours'
    and (
      profile_id = auth.uid()
      or exists (
        select 1
        from public.profiles p
        where p.id = profile_id
          and p.status = 'active'::public.user_status
          and coalesce(p.incognito, false) = false
      )
    )
  );
