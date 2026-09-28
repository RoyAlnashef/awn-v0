-- =============================================================================
-- Migration: fix_check_ins_rls_own_select
--
-- Allows members to read their own check_in row even when stale (>24h), so
-- upsert/update paths and own-row maintenance work under RLS.
--
-- IMPORTANT: Run manually in the Supabase SQL Editor.
-- =============================================================================

create policy "check_ins_select_own"
  on public.check_ins
  for select
  to authenticated
  using (profile_id = auth.uid());
