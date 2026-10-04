-- =============================================================================
-- Migration: feedback
--
-- Member feedback submissions and admin triage. Screenshots in private Storage.
--
-- IMPORTANT: Run this manually in the Supabase SQL Editor.
-- Agents must NEVER execute this against the project (no db push, no MCP SQL).
-- =============================================================================

-- Human-readable reference numbers: FB-1008, FB-1009, …
create sequence if not exists public.feedback_reference_seq
  start with 1008
  increment by 1
  no minvalue
  no maxvalue
  cache 1;

-- ---------------------------------------------------------------------------
-- feedback
-- ---------------------------------------------------------------------------

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  reference text unique not null,
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  status text not null default 'new',
  impact text,
  area text not null,
  summary text not null,
  details text not null,
  allow_contact boolean not null default false,
  context jsonb not null default '{}'::jsonb,
  admin_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint feedback_type_check check (
    type in ('bug', 'ux', 'idea', 'praise')
  ),
  constraint feedback_status_check check (
    status in ('new', 'triaged', 'planned', 'resolved', 'wont_fix')
  ),
  constraint feedback_impact_check check (
    impact is null or impact in ('blocking', 'annoying', 'minor')
  )
);

create index if not exists feedback_created_at_idx
  on public.feedback (created_at desc);

create index if not exists feedback_status_idx
  on public.feedback (status);

comment on table public.feedback is
  'In-app member feedback (bugs, UX, ideas, praise) for admin triage.';

create or replace function public.set_feedback_reference()
returns trigger
language plpgsql
as $$
begin
  if new.reference is null or new.reference = '' then
    new.reference := 'FB-' || nextval('public.feedback_reference_seq');
  end if;
  return new;
end;
$$;

create trigger feedback_set_reference
  before insert on public.feedback
  for each row
  execute function public.set_feedback_reference();

create or replace function public.set_feedback_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger feedback_set_updated_at
  before update on public.feedback
  for each row
  execute function public.set_feedback_updated_at();

alter table public.feedback enable row level security;

create policy "feedback_insert_self"
  on public.feedback
  for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "feedback_select_admin"
  on public.feedback
  for select
  to authenticated
  using (public.is_admin());

create policy "feedback_update_admin"
  on public.feedback
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- feedback_attachments (rows inserted via service role in server actions)
-- ---------------------------------------------------------------------------

create table if not exists public.feedback_attachments (
  id uuid primary key default gen_random_uuid(),
  feedback_id uuid not null references public.feedback (id) on delete cascade,
  storage_path text not null,
  file_name text not null,
  content_type text not null,
  size_bytes integer not null,
  width integer,
  height integer,
  created_at timestamptz not null default now()
);

create index if not exists feedback_attachments_feedback_id_idx
  on public.feedback_attachments (feedback_id);

comment on table public.feedback_attachments is
  'Screenshot metadata for feedback; files live in feedback-attachments Storage.';

alter table public.feedback_attachments enable row level security;

create policy "feedback_attachments_select_admin"
  on public.feedback_attachments
  for select
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage bucket: feedback-attachments (private)
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'feedback-attachments',
  'feedback-attachments',
  false,
  4194304,
  array['image/png', 'image/jpeg', 'image/webp', 'image/gif']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
