-- =============================================================================
-- Migration: error_logs
--
-- Client and server error logs for admin diagnostics.
--
-- IMPORTANT: Run this manually in the Supabase SQL Editor.
-- Agents must NEVER execute this against the project (no db push, no MCP SQL).
-- =============================================================================

create table if not exists public.error_logs (
  id uuid primary key default gen_random_uuid(),
  level text not null default 'error' check (level in ('error', 'warning')),
  source text not null check (source in ('client', 'server')),
  message text not null,
  stack text,
  context text,
  url text,
  user_agent text,
  user_id uuid references public.profiles (id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists error_logs_created_at_idx
  on public.error_logs (created_at desc);

create index if not exists error_logs_context_idx
  on public.error_logs (context);

comment on table public.error_logs is
  'Client and server error logs for admin diagnostics.';

alter table public.error_logs enable row level security;

-- Active owners/admins can read error logs.
create policy "error_logs_select_admin"
  on public.error_logs
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles p
      where p.id = auth.uid()
        and p.status = 'active'::public.user_status
        and p.role in ('owner'::public.user_role, 'admin'::public.user_role)
    )
  );

-- Inserts are performed via service role in API routes and server code (no insert policy).
