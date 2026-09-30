-- =============================================================================
-- Migration: create_legal_acceptances
--
-- IMPORTANT: Run this manually in the Supabase SQL Editor.
-- Agents must NEVER execute this against the project (no db push, no MCP SQL).
-- Paste the full contents of this file into the Dashboard -> SQL Editor -> Run.
-- =============================================================================
--
-- Records each member's acceptance of a legal/conduct document at a specific
-- version. One row per (profile, document); the row is upserted with the newly
-- accepted version. Version-aware: when a document's current version differs
-- from the accepted version, the member is re-prompted. `accepted_at` provides
-- a light audit trail.

create table public.legal_acceptances (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  document_key text not null,
  version text not null,
  accepted_at timestamptz not null default now(),
  unique (profile_id, document_key)
);

create index legal_acceptances_profile_idx on public.legal_acceptances (profile_id);

comment on table public.legal_acceptances is
  'Per-member acceptance of legal/conduct documents at a given version. Upserted per (profile_id, document_key).';

-- ---------------------------------------------------------------------------
-- Row Level Security: members manage only their own acceptance rows
-- ---------------------------------------------------------------------------

alter table public.legal_acceptances enable row level security;

create policy "legal_acceptances_select_own"
  on public.legal_acceptances
  for select
  to authenticated
  using (profile_id = auth.uid());

create policy "legal_acceptances_insert_own"
  on public.legal_acceptances
  for insert
  to authenticated
  with check (profile_id = auth.uid());

create policy "legal_acceptances_update_own"
  on public.legal_acceptances
  for update
  to authenticated
  using (profile_id = auth.uid())
  with check (profile_id = auth.uid());
