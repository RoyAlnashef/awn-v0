-- =============================================================================
-- Migration: push_subscriptions_drop_legacy_columns
--
-- Pre-v0 push_subscriptions stored web keys in separate NOT NULL columns
-- (p256dh, auth). v0 stores everything in subscription jsonb. After the repair
-- migration adds subscription, INSERTs that omit legacy columns fail with:
--   null value in column "p256dh" violates not-null constraint
--
-- Run manually in the Supabase SQL Editor after push_subscriptions_repair.
-- Agents must NEVER execute this against the project.
-- =============================================================================

-- Allow inserts that only populate subscription jsonb (safe interim step)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'push_subscriptions'
      and column_name = 'p256dh'
  ) then
    alter table public.push_subscriptions alter column p256dh drop not null;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'push_subscriptions'
      and column_name = 'auth'
  ) then
    alter table public.push_subscriptions alter column auth drop not null;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'push_subscriptions'
      and column_name = 'platform'
  ) then
    alter table public.push_subscriptions alter column platform drop not null;
  end if;
end
$$;

-- Remove legacy columns; v0 reads subscription jsonb only
alter table public.push_subscriptions drop column if exists p256dh;
alter table public.push_subscriptions drop column if exists auth;
alter table public.push_subscriptions drop column if exists platform;
alter table public.push_subscriptions drop column if exists token;
alter table public.push_subscriptions drop column if exists user_agent;
alter table public.push_subscriptions drop column if exists device_id;

notify pgrst, 'reload schema';
