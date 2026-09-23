-- First time the member saves their profile from Account (getting-started step).
--
-- IMPORTANT: Run this manually in the Supabase SQL Editor.
-- Agents must NEVER execute this against the project (no db push, no MCP SQL).

alter table public.profiles
  add column if not exists profile_saved_at timestamptz;

comment on column public.profiles.profile_saved_at is
  'Set the first time the member saves their profile from Account. Null = never saved.';
