# Employer Role & My Jobs Tabs — Plan

## Overview

Add an `employer` user role that unlocks job posting, then restructure the My Jobs page into three role-aware tabs: Jobs Posted (employers only), Saved Jobs (all), and My Applications (all). Owners and admins get full access throughout.

## Architecture

```
SessionUser.canPostJobs  (employer | owner | admin)
        │
        ├── /my-jobs redirect
        │       employer  → /my-jobs/created
        │       member    → /my-jobs/saved
        │
        ├── MyJobsNav tabs
        │       canPostJobs=true   → [Jobs Posted] [Saved Jobs] [My Applications]
        │       canPostJobs=false  →              [Saved Jobs] [My Applications]
        │
        └── AppSidebar sub-links
                canPostJobs=true   → Jobs Posted · Saved Jobs · My Applications
                canPostJobs=false  →             Saved Jobs · My Applications
```

---

## Task 1: Save Spec Documentation ✅

Created `agent-os/specs/2026-09-12-1152-employer-role-my-jobs-tabs/` with:
- `plan.md` — this file
- `shape.md` — scope, decisions, context
- `standards.md` — relevant coding standards
- `references.md` — similar code to reference

---

## Task 2: DB Migration — add `employer` enum value

Create `supabase/migrations/YYYYMMDD_add_employer_role.sql`:

```sql
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'employer';
```

Non-destructive; existing rows are unaffected.

---

## Task 3: Types & session helper

**`lib/users-data.ts`**
- Add `"Employer"` to `UserRole` union and `userRoles` array
- Add `"employer"` to `DbUserRole` union
- Add `Employer` entry to `roleConfig` (suggest `variant: "secondary"`)
- Update `toDbRole()` / `fromDbRole()` mappings

**`lib/auth/get-session-user.ts`**
- Add `canPostJobs: boolean` to `SessionUser` type
- Compute: `role === 'employer' || role === 'owner' || role === 'admin'`
- The profile select already fetches `role`, so no extra DB query needed

---

## Task 4: Guard job creation to employers + admins + owners

Find and update:
- The **job creation API route** (e.g. `POST /api/jobs`) — add a `canPostJobs` check using `requireApiUser()`, returning 403 if the user lacks the role
- The **"Post a Job" / "Create Job" UI button** — conditionally render only when `canPostJobs` is true (pass `canPostJobs` as a prop from the server page that hosts it)

---

## Task 5: My Jobs page — role-aware redirect & new Saved Jobs tab

**`app/(app)/my-jobs/page.tsx`**
- Call `getSessionUser()`, then redirect:
  - `canPostJobs` → `/my-jobs/created`
  - otherwise → `/my-jobs/saved`

**`app/(app)/my-jobs/layout.tsx` (or shell)**
- Fetch `getSessionUser()`, extract `canPostJobs`, pass it to `MyJobsNav`

**`components/jobs/my-jobs-nav.tsx`**
- Accept `canPostJobs: boolean` prop
- Build nav items dynamically:
  - `canPostJobs` → `[Jobs Posted, Saved Jobs, My Applications]`
  - otherwise → `[Saved Jobs, My Applications]`
- Rename `"My Jobs"` tab label → `"Jobs Posted"` (href stays `/my-jobs/created`)
- Add `"Saved Jobs"` tab → `/my-jobs/saved` with `Bookmark` icon

**New `app/(app)/my-jobs/saved/page.tsx`**
- Simple page component that renders `<SavedJobsSection />`

**New `components/jobs/saved-jobs-section.tsx`**
- SWR fetch: `fetchMyJobs("saved")` (key `/api/jobs/mine?tab=saved` — already in `lib/jobs/swr-keys.ts`)
- Render results using the existing `JobCard` grid layout (same as browse jobs page)
- Empty state: "No saved jobs yet. Browse jobs and bookmark ones you're interested in."

---

## Task 6: Update sidebar navigation

**`lib/nav.ts`**
- Rename `"My Jobs"` sub-item → `"Jobs Posted"`
- Add `{ title: "Saved Jobs", href: "/my-jobs/saved" }` sub-item

**`components/app-sidebar.tsx`**
- Accept `canPostJobs: boolean` prop (alongside existing `showAdminNav`)
- Filter out the `"Jobs Posted"` sub-item from the Jobs nav entry when `!canPostJobs`

**`app/(app)/layout.tsx`**
- Extract `canPostJobs` from `sessionUser`, pass to `<AppSidebar canPostJobs={...} />`

---

## Task 7: Admin panel — Employer role in user management

Since the `userRoles` array in `lib/users-data.ts` drives the role selector in the admin users table, adding `"Employer"` there (Task 3) should be sufficient. Verify the role dropdown renders `Employer` as an option and that the update action maps it correctly through `toDbRole()`.
