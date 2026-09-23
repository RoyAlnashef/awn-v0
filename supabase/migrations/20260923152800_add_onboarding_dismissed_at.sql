-- Per-user dismissal of the Now "Getting started" onboarding checklist.

alter table public.profiles
  add column if not exists onboarding_dismissed_at timestamptz;

comment on column public.profiles.onboarding_dismissed_at is
  'Timestamp when the member dismissed the Now getting-started checklist. Null = not dismissed.';
