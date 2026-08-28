-- =============================================================================
-- Migration: request_access_applications
--
-- Allow membership applications without an invite (public request-access flow).
--
-- IMPORTANT: Run this manually in the Supabase SQL Editor.
-- =============================================================================

create type public.membership_application_source as enum (
  'invite',
  'request_access'
);

alter table public.membership_applications
  add column if not exists source public.membership_application_source not null default 'invite';

alter table public.membership_applications
  alter column invite_id drop not null;

alter table public.membership_applications
  drop constraint if exists membership_applications_source_invite_check;

alter table public.membership_applications
  add constraint membership_applications_source_invite_check
  check (
    (source = 'invite'::public.membership_application_source and invite_id is not null)
    or (
      source = 'request_access'::public.membership_application_source
      and invite_id is null
    )
  );

comment on column public.membership_applications.source is
  'How the application was submitted: member invite link or public request-access form.';
