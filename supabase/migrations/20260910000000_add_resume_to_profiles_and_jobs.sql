-- =============================================================================
-- Migration: add_resume_to_profiles_and_jobs
--
-- Adds resume_url and resume_filename to user profiles (persisted across
-- applications) and resume_url to job_applications (snapshot at apply time).
--
-- IMPORTANT: Run this manually in the Supabase SQL Editor.
-- Agents must NEVER execute this against the project (no db push, no MCP SQL).
-- Paste the full contents of this file into the Dashboard → SQL Editor → Run.
-- =============================================================================

alter table public.profiles
  add column if not exists resume_url text,
  add column if not exists resume_filename text;

alter table public.job_applications
  add column if not exists resume_url text;
