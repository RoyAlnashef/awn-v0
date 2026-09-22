-- =============================================================================
-- Migration: push_subscriptions_repair
--
-- Repairs push_subscriptions when an older table existed without the v0
-- subscription jsonb column (CREATE TABLE IF NOT EXISTS skipped the add).
--
-- IMPORTANT: Run this manually in the Supabase SQL Editor.
-- Agents must NEVER execute this against the project (no db push, no MCP SQL).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Core v0 column
-- ---------------------------------------------------------------------------

alter table public.push_subscriptions
  add column if not exists subscription jsonb;

alter table public.push_subscriptions
  add column if not exists updated_at timestamptz not null default now();

-- ---------------------------------------------------------------------------
-- Backfill subscription jsonb from legacy column layouts (if present)
-- ---------------------------------------------------------------------------

do $$
begin
  -- Legacy native rows: platform + endpoint-as-token
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'push_subscriptions'
      and column_name = 'platform'
  ) then
    update public.push_subscriptions ps
    set subscription = jsonb_build_object(
      'type', 'native',
      'token', ps.endpoint,
      'platform', ps.platform
    )
    where ps.subscription is null
      and ps.platform in ('ios', 'android');
  end if;

  -- Legacy web rows: separate p256dh + auth columns
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'push_subscriptions'
      and column_name = 'p256dh'
  ) and exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'push_subscriptions'
      and column_name = 'auth'
  ) then
    execute $sql$
      update public.push_subscriptions ps
      set subscription = jsonb_build_object(
        'type', 'web',
        'endpoint', ps.endpoint,
        'keys', jsonb_build_object(
          'p256dh', ps.p256dh,
          'auth', ps.auth
        )
      )
      where ps.subscription is null
        and ps.p256dh is not null
        and ps.auth is not null
    $sql$;
  end if;
end
$$;

-- Placeholder for any rows still missing subscription payload
update public.push_subscriptions
set subscription = '{}'::jsonb
where subscription is null;

alter table public.push_subscriptions
  alter column subscription set not null;

-- ---------------------------------------------------------------------------
-- Ensure v0 indexes / RLS (idempotent)
-- ---------------------------------------------------------------------------

create unique index if not exists push_subscriptions_endpoint_key
  on public.push_subscriptions (endpoint);

create index if not exists push_subscriptions_user_id_idx
  on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

drop policy if exists "Users manage own push subscriptions" on public.push_subscriptions;
create policy "Users manage own push subscriptions"
  on public.push_subscriptions
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Service role reads all push subscriptions" on public.push_subscriptions;
create policy "Service role reads all push subscriptions"
  on public.push_subscriptions
  for select
  using (auth.role() = 'service_role');

-- ---------------------------------------------------------------------------
-- Reload PostgREST schema cache
-- ---------------------------------------------------------------------------

notify pgrst, 'reload schema';

comment on column public.push_subscriptions.subscription is
  'Web Push subscription object or native token payload ({ type, token, platform }).';

-- =============================================================================
