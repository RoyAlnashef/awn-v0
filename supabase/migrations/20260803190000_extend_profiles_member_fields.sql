-- =============================================================================
-- Migration: extend_profiles_member_fields
--
-- IMPORTANT: Run this manually in the Supabase SQL Editor.
-- Agents must NEVER execute this against the project (no db push, no MCP SQL).
-- Paste the full contents of this file into the Dashboard → SQL Editor → Run.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Enums for member profile fields
-- ---------------------------------------------------------------------------

create type public.member_availability as enum (
  'available_now',
  'between_tours',
  'on_tour'
);

create type public.venue_tier as enum (
  'stadium',
  'arena',
  'festival',
  'theater',
  'club'
);

create type public.work_auth as enum (
  'passport',
  'usa',
  'canada',
  'uk',
  'eu',
  'australia',
  'worldwide'
);

-- ---------------------------------------------------------------------------
-- Extend profiles with member-facing fields
-- ---------------------------------------------------------------------------

alter table public.profiles
  add column if not exists company text,
  add column if not exists home_base text,
  add column if not exists city text,
  add column if not exists bio text,
  add column if not exists years_experience integer not null default 0,
  add column if not exists availability public.member_availability not null default 'between_tours',
  add column if not exists available_from date,
  add column if not exists available_to date,
  add column if not exists venue_tiers public.venue_tier[] not null default '{}',
  add column if not exists work_auth public.work_auth[] not null default '{}',
  add column if not exists skills text[] not null default '{}',
  add column if not exists banner_url text,
  add column if not exists banner_position_y smallint not null default 50,
  add column if not exists is_verified boolean not null default false,
  add column if not exists is_founding_member boolean not null default false;

alter table public.profiles
  add constraint profiles_years_experience_nonneg
    check (years_experience >= 0);

alter table public.profiles
  add constraint profiles_banner_position_y_range
    check (banner_position_y >= 0 and banner_position_y <= 100);

comment on column public.profiles.company is
  'Employer or company name shown on member profile.';
comment on column public.profiles.home_base is
  'Home base location, e.g. Nashville, TN.';
comment on column public.profiles.availability is
  'Member availability status for directory and profile card.';

-- ---------------------------------------------------------------------------
-- Guard admin-only columns on self-update
-- ---------------------------------------------------------------------------

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
  end if;

  return new;
end;
$$;

create trigger profiles_guard_self_update
  before update on public.profiles
  for each row
  execute function public.guard_profiles_self_update();

-- ---------------------------------------------------------------------------
-- RLS: allow members to update their own profile
-- ---------------------------------------------------------------------------

create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- =============================================================================
