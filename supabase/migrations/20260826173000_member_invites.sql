-- =============================================================================
-- Migration: member_invites
--
-- Member invite loop: member_invites, membership_applications, notifications,
-- and profiles approval gate (is_approved + pending user_status).
--
-- IMPORTANT: Run this manually in the Supabase SQL Editor.
-- Agents must NEVER execute this against the project (no db push, no MCP SQL).
-- Paste the full contents of this file into the Dashboard → SQL Editor → Run.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extend user_status enum
-- ---------------------------------------------------------------------------

alter type public.user_status add value if not exists 'pending';

-- ---------------------------------------------------------------------------
-- Enums for invite + application flow
-- ---------------------------------------------------------------------------

create type public.member_invite_status as enum (
  'pending',
  'accepted',
  'rescinded',
  'expired'
);

create type public.membership_application_status as enum (
  'pending',
  'approved',
  'denied'
);

create type public.application_note_visibility as enum (
  'invitee_only',
  'both'
);

-- ---------------------------------------------------------------------------
-- Profiles: approval gate
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column if not exists is_approved boolean not null default false;

comment on column public.profiles.is_approved is
  'When false, authenticated user is gated to /pending until admin approves their application.';

-- Existing active members retain full access after migration.
update public.profiles
set is_approved = true
where status = 'active'::public.user_status;

-- ---------------------------------------------------------------------------
-- Auto-create profile when an auth user is created (application flow aware)
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_name text;
  is_application_flow boolean;
begin
  is_application_flow := coalesce(
    (new.raw_user_meta_data ->> 'application_flow')::boolean,
    false
  );

  meta_name := coalesce(
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name',
    split_part(new.email, '@', 1)
  );

  insert into public.profiles (id, email, full_name, status, role, is_approved)
  values (
    new.id,
    coalesce(new.email, ''),
    meta_name,
    case
      when is_application_flow
        then 'pending'::public.user_status
      when new.invited_at is not null and new.last_sign_in_at is null
        then 'invited'::public.user_status
      else 'active'::public.user_status
    end,
    'member'::public.user_role,
    case
      when is_application_flow then false
      when coalesce((new.raw_user_meta_data ->> 'is_approved')::boolean, false)
        then true
      else false
    end
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(public.profiles.full_name, excluded.full_name);

  return new;
end;
$$;

-- Prevent members from toggling their own approval flag.
create or replace function public.guard_profiles_self_update()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is not null
     and auth.uid() = old.id
     and not public.is_admin() then
    if new.role is distinct from old.role then
      raise exception 'Cannot change role on own profile';
    end if;
    if new.status is distinct from old.status then
      raise exception 'Cannot change status on own profile';
    end if;
    if new.email is distinct from old.email then
      raise exception 'Cannot change email on own profile';
    end if;
    if new.is_verified is distinct from old.is_verified then
      raise exception 'Cannot change verification on own profile';
    end if;
    if new.is_founding_member is distinct from old.is_founding_member then
      raise exception 'Cannot change founding member flag on own profile';
    end if;
    if new.is_approved is distinct from old.is_approved then
      raise exception 'Cannot change approval on own profile';
    end if;
  end if;

  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Member invites
-- ---------------------------------------------------------------------------

create table public.member_invites (
  id uuid primary key default gen_random_uuid(),
  inviter_id uuid not null references public.profiles (id) on delete cascade,
  invitee_email text not null,
  token text not null,
  status public.member_invite_status not null default 'pending',
  sent_at timestamptz not null default now(),
  rescinded_at timestamptz,
  accepted_at timestamptz,
  constraint member_invites_invitee_email_nonempty check (char_length(trim(invitee_email)) > 0),
  constraint member_invites_token_nonempty check (char_length(trim(token)) > 0)
);

create unique index member_invites_token_idx on public.member_invites (token);
create index member_invites_inviter_id_idx on public.member_invites (inviter_id);
create index member_invites_status_idx on public.member_invites (status);
create index member_invites_invitee_email_idx on public.member_invites (lower(invitee_email));

-- One pending invite per email per member; rescinding frees the slot for re-invite.
create unique index member_invites_inviter_email_pending_idx
  on public.member_invites (inviter_id, lower(invitee_email))
  where status = 'pending'::public.member_invite_status;

comment on table public.member_invites is
  'Email invites sent by members. Token links to /apply?token=TOKEN.';

-- ---------------------------------------------------------------------------
-- Membership applications
-- ---------------------------------------------------------------------------

create table public.membership_applications (
  id uuid primary key default gen_random_uuid(),
  invite_id uuid not null references public.member_invites (id) on delete cascade,
  invitee_user_id uuid references auth.users (id) on delete set null,
  full_name text not null,
  email text not null,
  title text not null,
  resume_url text,
  social_links jsonb not null default '{}'::jsonb,
  status public.membership_application_status not null default 'pending',
  admin_note text,
  note_visibility public.application_note_visibility,
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint membership_applications_full_name_nonempty check (char_length(trim(full_name)) > 0),
  constraint membership_applications_email_nonempty check (char_length(trim(email)) > 0),
  constraint membership_applications_title_nonempty check (char_length(trim(title)) > 0),
  constraint membership_applications_social_links_object check (jsonb_typeof(social_links) = 'object')
);

create unique index membership_applications_invite_id_idx
  on public.membership_applications (invite_id);
create index membership_applications_invitee_user_id_idx
  on public.membership_applications (invitee_user_id);
create index membership_applications_status_idx
  on public.membership_applications (status);
create index membership_applications_email_idx
  on public.membership_applications (lower(email));

comment on table public.membership_applications is
  'Invitee application submitted via /apply?token=TOKEN.';
comment on column public.membership_applications.social_links is
  'JSON object with optional keys: linkedin, instagram, twitter, youtube, website.';

-- Link invite → application after submit (circular FK resolved after both tables exist).
alter table public.member_invites
  add column application_id uuid references public.membership_applications (id) on delete set null;

create unique index member_invites_application_id_idx
  on public.member_invites (application_id)
  where application_id is not null;

-- Keep updated_at fresh
create or replace function public.set_membership_applications_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger membership_applications_set_updated_at
  before update on public.membership_applications
  for each row
  execute function public.set_membership_applications_updated_at();

-- ---------------------------------------------------------------------------
-- Notifications
-- ---------------------------------------------------------------------------

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null,
  title text not null,
  body text not null,
  data jsonb not null default '{}'::jsonb,
  read boolean not null default false,
  created_at timestamptz not null default now(),
  constraint notifications_kind_nonempty check (char_length(trim(kind)) > 0),
  constraint notifications_title_nonempty check (char_length(trim(title)) > 0),
  constraint notifications_data_object check (jsonb_typeof(data) = 'object')
);

create index notifications_user_read_created_idx
  on public.notifications (user_id, read, created_at desc);

comment on table public.notifications is
  'In-app notifications for authenticated members.';
comment on column public.notifications.kind is
  'Notification type key (e.g. invite_accepted, application_denied).';
comment on column public.notifications.data is
  'Optional JSON payload for deep links and related entity IDs.';

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.member_invites enable row level security;
alter table public.membership_applications enable row level security;
alter table public.notifications enable row level security;

-- Member invites: members manage own; admins read all
create policy "member_invites_select_own_or_admin"
  on public.member_invites
  for select
  to authenticated
  using (inviter_id = auth.uid() or public.is_admin());

create policy "member_invites_insert_own"
  on public.member_invites
  for insert
  to authenticated
  with check (inviter_id = auth.uid());

create policy "member_invites_update_own"
  on public.member_invites
  for update
  to authenticated
  using (inviter_id = auth.uid())
  with check (inviter_id = auth.uid());

-- Membership applications: invitee reads own; admins read/update all
create policy "membership_applications_select_own_or_admin"
  on public.membership_applications
  for select
  to authenticated
  using (invitee_user_id = auth.uid() or public.is_admin());

create policy "membership_applications_update_admin"
  on public.membership_applications
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Notifications: users read/update own rows only (insert via service role)
create policy "notifications_select_own"
  on public.notifications
  for select
  to authenticated
  using (user_id = auth.uid());

create policy "notifications_update_own"
  on public.notifications
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- =============================================================================
