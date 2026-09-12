# References — Employer Role & My Jobs Tabs

## Similar Implementations

### Admin access gating (`canAccessAdmin`)

- **Location:** `lib/auth/require-admin.ts`, `lib/auth/get-session-user.ts`
- **Relevance:** Direct pattern to follow for `canPostJobs`. `canAccessAdmin` is a boolean derived from `profile.role` at session-fetch time and threaded down as a prop. `canPostJobs` follows the exact same shape.
- **Key patterns:**
  - Computed once in `getSessionUser()`, cached per-request via `React.cache()`
  - Passed as a prop to layout/sidebar (`showAdminNav={sessionUser.canAccessAdmin}`)
  - Used in server page guards (`if (!sessionUser.canAccessAdmin) redirect(...)`)
  - Used in server actions (`requireAdmin()` throws `AuthError`)

### Role type system

- **Location:** `lib/users-data.ts`
- **Relevance:** `UserRole`, `DbUserRole`, `toDbRole()`, `fromDbRole()`, `roleConfig` — the exact objects that need `employer` added.
- **Key patterns:** UI label ↔ DB value mapping kept in one file; `roleConfig` drives badge rendering in the admin users table.

### Saved jobs backend

- **Location:** `app/api/jobs/mine/route.ts`, `lib/jobs/fetch.ts`, `lib/jobs/swr-keys.ts`
- **Relevance:** `GET /api/jobs/mine?tab=saved` is already implemented and returns `{ jobs: Job[] }` with `saved: true` and `savedAt`. `fetchMyJobs("saved")` is the client-side fetcher. Only the UI tab and route page are missing.
- **Key patterns:** All three mine tabs (`created`, `saved`, `applied`) follow the same SWR → API → Supabase shape.

### My Applications tab (existing)

- **Location:** `components/jobs/applications-section.tsx`, `app/(app)/my-jobs/applications/page.tsx`
- **Relevance:** Template for the new `SavedJobsSection` — SWR fetch, loading/error states, empty state, row/card rendering.

### Sidebar role-aware rendering

- **Location:** `components/app-sidebar.tsx`, `app/(app)/layout.tsx`
- **Relevance:** `showAdminNav` prop pattern is the model for `canPostJobs`. The admin nav section is already conditionally rendered; the same technique applies to filtering the "Jobs Posted" sub-link.
- **Key patterns:** Server layout fetches `sessionUser`, extracts boolean, passes to client sidebar component as prop.

### Job bookmark UI

- **Location:** `components/jobs/job-card.tsx`, `components/jobs/job-row.tsx`, `lib/jobs/fetch.ts` (`toggleSaveJob`)
- **Relevance:** The Saved Jobs tab will render saved jobs using the same `JobCard` component used on the browse page. No new bookmark logic needed.
