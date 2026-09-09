# References for Member Invites

## Similar Implementations

### Admin Users table + invite dialog

- **Location:** `components/users/users-table.tsx`, `components/users/invite-user-dialog.tsx`, `app/(app)/users/page.tsx`
- **Relevance:** Closest existing admin onboarding surface — table patterns, invite CTA in PageShell actions, server action conventions
- **Key patterns:** RSC initial load; `{ ok, error }` unions from `lib/users/actions.ts`; `createAdminClient()` for auth user creation; role/status badges
- **Note:** Current `createUser` creates accounts directly with password — this spec replaces that flow for member referrals with token-based invites + application review

### People page + profile drawer

- **Location:** `app/(app)/people/page.tsx`, `components/people/people-board.tsx`, `components/people/person-profile-drawer.tsx`
- **Relevance:** Member invite drawer trigger lives on People page; drawer UX follows existing flyout pattern
- **Key patterns:** `PageShell` with actions slot; `Drawer` + `FLYOUT_DRAWER_CONTENT_CLASS`; server actions in `lib/people/actions.ts`

### Notifications panel (UI shell)

- **Location:** `components/notifications.tsx`, `lib/notifications-data.ts`
- **Relevance:** Fully built UI with mock data — wire to real DB + SWR fetch
- **Key patterns:** Sheet flyout in site header; mark read/unread local state (to become server-backed); `NotificationKind` type + icon mapping

### Login / auth flow

- **Location:** `components/auth/login-form.tsx`, `lib/supabase/middleware.ts`, `app/auth/callback/route.ts`
- **Relevance:** Magic link blocks self-signup (`shouldCreateUser: false`); middleware session refresh; approval gate extends middleware
- **Key patterns:** Password + OTP login; redirect unauthenticated to `/login`; safe redirect sanitization

### Job applications (different domain — patterns only)

- **Location:** `app/(app)/my-jobs/applications/page.tsx`, `lib/jobs/server.ts`, `supabase/migrations/20260726100000_create_jobs_tables.sql`
- **Relevance:** Existing `job_applications` table and status enum — do not conflate with membership applications
- **Key patterns:** Application status lifecycle; applicant FK to profiles

### Admin page placeholders

- **Location:** `app/(app)/invites/page.tsx`, `app/(app)/applications/page.tsx`
- **Relevance:** Target pages to replace — currently empty PageShell shells with nav metadata from `lib/nav.ts`

### Product notes (prior iteration)

- **Location:** `agent-os/product/notes/_tmp-invite-flow-summary.md`
- **Relevance:** Documents a fuller invite-only flow from a previous app iteration — informs schema naming and flow decisions; not all paths are in scope for Phase 1
