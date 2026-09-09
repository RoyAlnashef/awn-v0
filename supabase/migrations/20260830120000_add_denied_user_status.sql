-- =============================================================================
-- Migration: add_denied_user_status
--
-- Adds `denied` to public.user_status and backfills profiles linked to denied
-- membership applications.
--
-- IMPORTANT: Run this manually in the Supabase SQL Editor.
-- Agents must NEVER execute this against the project (no db push, no MCP SQL).
-- Paste the full contents of this file into the Dashboard → SQL Editor → Run.
-- =============================================================================

alter type public.user_status add value if not exists 'denied';

-- Backfill profiles linked to denied applications
update public.profiles p
set status = 'denied'::public.user_status,
    is_approved = false
from public.membership_applications a
where a.invitee_user_id = p.id
  and a.status = 'denied'
  and p.status = 'pending'::public.user_status;
