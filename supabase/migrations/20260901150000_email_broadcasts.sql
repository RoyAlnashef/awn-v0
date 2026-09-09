-- =============================================================================
-- Migration: email_broadcasts
--
-- Admin broadcast email send history.
--
-- IMPORTANT: Run this manually in the Supabase SQL Editor.
-- Agents must NEVER execute this against the project (no db push, no MCP SQL).
-- =============================================================================

create table if not exists public.email_broadcasts (
  id uuid primary key default gen_random_uuid(),
  subject text not null,
  html_body text not null,
  filters jsonb not null default '{}'::jsonb,
  recipient_count integer not null default 0 check (recipient_count >= 0),
  sent_by uuid not null references public.profiles (id) on delete restrict,
  sent_at timestamptz not null default now(),
  test_sent_at timestamptz,
  resend_batch_id text
);

create index if not exists email_broadcasts_sent_at_idx
  on public.email_broadcasts (sent_at desc);

comment on table public.email_broadcasts is
  'History of admin broadcast emails sent to members via Resend.';

alter table public.email_broadcasts enable row level security;

-- Active owners/admins can read broadcast history.
create policy "email_broadcasts_select_admin"
  on public.email_broadcasts
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

-- Inserts are performed via service role in server actions (no insert policy for authenticated).
