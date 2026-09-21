-- =============================================================================
-- Migration: room_memberships_insert_admin
--
-- IMPORTANT: Run this manually in the Supabase SQL Editor.
-- Agents must NEVER execute this against the project (no db push, no MCP SQL).
-- Paste the full contents of this file into the Dashboard → SQL Editor → Run.
-- Requires: 20260920173000_room_member_removals.sql
-- =============================================================================

-- Admins must be able to grant membership when approving join requests.
-- The insert_self policy only allows profile_id = auth.uid().

create policy "room_memberships_insert_admin"
  on public.room_memberships
  for insert
  to authenticated
  with check (public.is_admin());

-- =============================================================================
