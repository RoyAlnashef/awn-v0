# Admin Users + Profiles Schema

## Shaping decisions (locked)

- **Table model:** `public.profiles` with `id uuid primary key references auth.users(id) on delete cascade`
- **Scope:** Wire existing Admin → Users UI only — invite (create), list/search/filter (read), edit role + suspend/reactivate (update), delete, and bulk variants of those updates/deletes
- **Deferred:** `profile_type`, `is_approved`, verify badge, founding flag, admin notes, CSV export, magic-link send, real 2FA admin ops (Reset/Require 2FA stay UI stubs)
- **Migration rule (hard):** Agents create `.sql` migration files only. **Never** run migrations against Supabase (no CLI `db push`, no Dashboard API, no MCP SQL). You paste each file into the Supabase SQL Editor.

## Product alignment

- Inventory: replace email-allowlist admin with RBAC (`Owner` / `Admin` / `Manager` / `Member`) from `lib/users-data.ts`
- Roadmap P0: data layer + RBAC; Admin Users is the first real admin CRUD surface
- Mission: invite-only curated network — Invite user creates a pre-invited account (`status = Invited`)

## Visuals / references

- **Visual:** `visuals/admin-users-table.png`
- **References:** `components/users/users-table.tsx`, `lib/users-data.ts`, `lib/supabase/admin.ts`, `lib/supabase/server.ts`, `app/(app)/users/page.tsx`
- **Standards:** page-shell, sidebar-nav, shadcn-ui, design-tokens — keep existing Users table chrome; no new page chrome

## Target data model

- `user_role`: `owner` | `admin` | `manager` | `member`
- `user_status`: `active` | `invited` | `suspended`
- Trigger on `auth.users` insert → upsert minimal `profiles` row
- RLS: own row read; owner/admin manage all
- Seed comment: promote known email to owner for testing

## Architecture

- RSC load on users page + `"use server"` mutations
- Invite/delete auth users via `createAdminClient()` only
- Every mutating action calls `requireAdmin()`
- Auth login UI out of scope

## Tasks

1. Save spec documentation (this folder)
2. Write profiles migration SQL (do not run)
3. Types + `requireAdmin()` + server actions
4. Wire Users page + CRUD UI
5. Smoke-check notes for human verification
