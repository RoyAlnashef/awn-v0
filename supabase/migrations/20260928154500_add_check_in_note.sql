-- =============================================================================
-- Migration: add_check_in_note
--
-- IMPORTANT: Run this manually in the Supabase SQL Editor.
-- Agents must NEVER execute this against the project (no db push, no MCP SQL).
-- =============================================================================

alter table public.check_ins
  add column if not exists note text;

comment on column public.check_ins.note is
  'Optional status note (max 80 characters) shown on check-in.';
