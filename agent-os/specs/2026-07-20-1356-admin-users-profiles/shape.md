# Admin Users + Profiles — Shaping Notes

## Scope

Create a Supabase `public.profiles` table (1:1 with `auth.users`) and wire Admin → Users for real CRUD and bulk actions.

In scope:

- **Create** via Invite user (auth invite + profile `status = invited`)
- **Read** list with search and role/status filters
- **Update** role; suspend / reactivate
- **Delete** user (auth delete cascades to profile)
- **Bulk** role change, suspend, reactivate, delete

## Decisions

- Table: `public.profiles` with `id` = `auth.users.id` (not a standalone `users` table)
- RBAC roles: Owner / Admin / Manager / Member (DB enums lowercase)
- Account status: Active / Invited / Suspended
- Agents **never** execute SQL against Supabase — migration files only; human pastes into SQL Editor
- Auth login UI is out of scope; E2E needs a dashboard-created session + owner seed
- 2FA column is display-only; Reset/Require 2FA remain stubs
- View profile remains a non-functional stub

## Deferred

- `profile_type`, `is_approved`, verify badge, founding member flag, admin notes
- CSV export, magic-link send
- Real 2FA admin operations
- Full member-management fields from the migration inventory beyond the Users table columns

## Context

- **Visuals:** `visuals/admin-users-table.png` — Admin Users table mockup/UI
- **References:** Existing Users table UI + Supabase client helpers (no prior admin CRUD pattern)
- **Product alignment:** P0 data layer + RBAC; invite-only network; replace email-allowlist admin access

## Standards Applied

- `global/page-shell` — Users page stays in PageShell
- `global/sidebar-nav` — title/description from `adminNav`
- `css/shadcn-ui` — compose from `@/components/ui/*`
- `css/design-tokens` — semantic tokens only
