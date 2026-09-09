-- =============================================================================
-- Migration: clear_presence
--
-- Run manually in Supabase SQL Editor after touch_presence.
-- Clears last_active_at on logout / tab close so users appear offline promptly.
-- =============================================================================

create or replace function public.clear_last_active()
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
  set last_active_at = null
  where id = auth.uid();
end;
$$;

revoke all on function public.clear_last_active() from public;
grant execute on function public.clear_last_active() to authenticated;
