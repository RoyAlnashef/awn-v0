-- =============================================================================
-- Migration: add_job_draft_status
--
-- IMPORTANT: Run this manually in the Supabase SQL Editor.
-- Agents must NEVER execute this against the project (no db push, no MCP SQL).
-- =============================================================================

ALTER TYPE public.job_status ADD VALUE IF NOT EXISTS 'draft';
