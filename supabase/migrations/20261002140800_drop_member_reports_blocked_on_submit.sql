-- =============================================================================
-- Migration: drop_member_reports_blocked_on_submit
--
-- IMPORTANT: Run this manually in the Supabase SQL Editor.
-- Agents must NEVER execute this against the project (no db push, no MCP SQL).
-- =============================================================================

alter table public.member_reports
  drop column if exists blocked_on_submit;
