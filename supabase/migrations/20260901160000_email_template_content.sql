-- =============================================================================
-- Migration: email_template_content
--
-- Admin-editable overrides for transactional email template copy.
--
-- IMPORTANT: Run this manually in the Supabase SQL Editor.
-- Agents must NEVER execute this against the project (no db push, no MCP SQL).
-- =============================================================================

create table if not exists public.email_template_content (
  template_id text primary key,
  content jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid not null references public.profiles (id) on delete restrict
);

create index if not exists email_template_content_updated_at_idx
  on public.email_template_content (updated_at desc);

comment on table public.email_template_content is
  'Admin-editable copy overrides for AWN email templates. Defaults live in code.';

alter table public.email_template_content enable row level security;

-- Active owners/admins can read template content overrides.
create policy "email_template_content_select_admin"
  on public.email_template_content
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

-- Inserts/updates are performed via service role in server actions (no write policy for authenticated).
