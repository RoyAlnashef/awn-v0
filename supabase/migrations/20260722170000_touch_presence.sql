-- =============================================================================
-- Migration: touch_presence
--
-- Run manually in Supabase SQL Editor.
-- Lets authenticated users update their own last_active_at for online presence.
-- =============================================================================

create or replace function public.touch_last_active()
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
  set last_active_at = now()
  where id = auth.uid()
    and (
      last_active_at is null
      or last_active_at < now() - interval '1 minute'
    );
end;
$$;

revoke all on function public.touch_last_active() from public;
grant execute on function public.touch_last_active() to authenticated;
