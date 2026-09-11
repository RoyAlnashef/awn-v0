-- =============================================================================
-- Migration: add_resume_filename_to_profiles
--
-- Adds resume_filename to profiles for displaying the original upload name.
-- Run this if you already applied 20260910000000_add_resume_to_profiles_and_jobs.sql
-- without resume_filename.
--
-- IMPORTANT: Run this manually in the Supabase SQL Editor.
-- Agents must NEVER execute this against the project (no db push, no MCP SQL).
-- Paste the full contents of this file into the Dashboard → SQL Editor → Run.
-- =============================================================================

alter table public.profiles
  add column if not exists resume_filename text;
