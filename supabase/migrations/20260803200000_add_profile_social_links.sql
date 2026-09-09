-- =============================================================================
-- Migration: add_profile_social_links
--
-- IMPORTANT: Run this manually in the Supabase SQL Editor.
-- Agents must NEVER execute this against the project (no db push, no MCP SQL).
-- Paste the full contents of this file into the Dashboard → SQL Editor → Run.
-- =============================================================================

alter table public.profiles
  add column if not exists website text,
  add column if not exists instagram text,
  add column if not exists twitter text,
  add column if not exists linkedin text,
  add column if not exists youtube text;
