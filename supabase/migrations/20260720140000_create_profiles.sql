-- =============================================================================
-- Migration: create_profiles
--
-- IMPORTANT: Run this manually in the Supabase SQL Editor.
-- Agents must NEVER execute this against the project (no db push, no MCP SQL).
-- Paste the full contents of this file into the Dashboard → SQL Editor → Run.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.user_role as enum ('owner', 'admin', 'manager', 'member');
create type public.user_status as enum ('active', 'invited', 'suspended');

-- ---------------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text not null,
  avatar_url text,
  title text,
  role public.user_role not null default 'member',
  status public.user_status not null default 'invited',
  two_factor_enabled boolean not null default false,
  last_active_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_email_idx on public.profiles (email);
create index profiles_role_idx on public.profiles (role);
create index profiles_status_idx on public.profiles (status);

comment on table public.profiles is
  'App profile + RBAC for each auth.users row. Admin Users table reads from here.';

-- Keep updated_at fresh
create or replace function public.set_profiles_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_profiles_updated_at();

-- ---------------------------------------------------------------------------
-- Auto-create profile when an auth user is created
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta_name text;
begin
  meta_name := coalesce(
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'name',
    split_part(new.email, '@', 1)
  );

  insert into public.profiles (id, email, full_name, status, role)
  values (
    new.id,
    coalesce(new.email, ''),
    meta_name,
    case
      when new.invited_at is not null and new.last_sign_in_at is null
        then 'invited'::public.user_status
      else 'active'::public.user_status
    end,
    'member'::public.user_role
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(public.profiles.full_name, excluded.full_name);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- RLS helpers (security definer to avoid recursive policy checks)
-- ---------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role in ('owner'::public.user_role, 'admin'::public.user_role)
      and p.status = 'active'::public.user_status
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;

-- Authenticated users can read their own profile
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using (id = auth.uid() or public.is_admin());

-- Admins can update any profile; users can update limited own fields later
create policy "profiles_update_admin"
  on public.profiles
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Admins can insert (rare; normally trigger creates rows)
create policy "profiles_insert_admin"
  on public.profiles
  for insert
  to authenticated
  with check (public.is_admin());

-- Admins can delete profiles (auth user delete also cascades)
create policy "profiles_delete_admin"
  on public.profiles
  for delete
  to authenticated
  using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Seed helper (run separately after creating your auth user in the dashboard)
-- ---------------------------------------------------------------------------
--
-- Replace 'you@example.com' with your email, then run in SQL Editor:
--
--   update public.profiles
--   set role = 'owner',
--       status = 'active',
--       full_name = coalesce(full_name, 'Owner')
--   where email = 'you@example.com';
--
-- =============================================================================
