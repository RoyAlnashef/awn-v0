# References for My Jobs Applications Tabs

## Tab Navigation Pattern

### account-nav.tsx

- **Location:** `components/account/account-nav.tsx`
- **Relevance:** Source pattern for `MyJobsNav` — pill button nav on desktop, `NativeSelect` on mobile
- **Key patterns:** `NAV_ITEMS` array with label/href/icon; `usePathname()` for active state; `Button variant={active ? "secondary" : "outline"}` with `render={<Link href={href} />}`; mobile `NativeSelect` with `router.push`

---

## Existing My Jobs UI

### my-jobs-board.tsx

- **Location:** `components/jobs/my-jobs-board.tsx`
- **Relevance:** Current created jobs list — refactor into `CreatedJobsSection`, remove `PageShell` wrapper (moves to layout shell)
- **Key patterns:** SWR via `fetchMyJobs("created")` + `myJobsKey`; responsive grid; dashed empty state with Briefcase icon; `MyJobListItem` cards; loading skeletons

### my-job-list-item.tsx

- **Location:** `components/jobs/my-job-list-item.tsx`
- **Relevance:** Card visual language to reuse for `MyApplicationListItem` (badges, role, production, location, pay, dates)
- **Key patterns:** Job status badges, engagement stats, edit/pause/duplicate actions (created tab only)

### job-card.tsx

- **Location:** `components/jobs/job-card.tsx`
- **Relevance:** Shared job card styling reference for application cards

### job-detail-drawer.tsx

- **Location:** `components/jobs/job-detail-drawer.tsx`
- **Relevance:** Applicant view when clicking an application card — read-only job details in flyout drawer
- **Key patterns:** `jobId` + `open` + `onOpenChange` props; SWR fetch via `fetchJob`; `JobDetailContent` inside `Drawer`

---

## API Routes

### GET /api/jobs/mine

- **Location:** `app/api/jobs/mine/route.ts`
- **Relevance:** Extend with `tab=applied` — query `job_applications` joined to `job_postings` + poster profile
- **Key patterns:** Existing `tab=created` and `tab=saved` handlers; shared `JOB_SELECT` and `mapRow`; order by `created_at DESC`

### DELETE /api/jobs/[id]/apply

- **Location:** `app/api/jobs/[id]/apply/route.ts`
- **Relevance:** Withdraw action — sets application `status` to `withdrawn`; no API changes needed
- **Key patterns:** Auth via `requireApiUser()`; finds non-withdrawn application by `job_id` + `applicant_id`; returns 204 on success

### POST /api/jobs/[id]/apply

- **Location:** `app/api/jobs/[id]/apply/route.ts`
- **Relevance:** Context for re-apply after withdraw (out of scope for UI, but API supports it)

---

## Library Helpers

### lib/jobs/fetch.ts

- **Location:** `lib/jobs/fetch.ts`
- **Relevance:** Add `AppliedJob` type, `fetchMyApplications()`, and `withdrawFromJob(jobId)`
- **Key patterns:** Existing `fetchMyJobs(tab)` helper; error handling via `throw new Error`

### lib/jobs/swr-keys.ts

- **Location:** `lib/jobs/swr-keys.ts`
- **Relevance:** Add `myApplicationsKey` for SWR cache invalidation after withdraw
- **Key patterns:** Existing `myJobsKey` factory

### lib/jobs/format.ts

- **Location:** `lib/jobs/format.ts`
- **Relevance:** `applicationStatusStyles` for status badges on application cards
- **Key patterns:** `Record<ApplicationStatus, string>` with semantic color tokens

---

## Layout & Routing

### page-shell.tsx

- **Location:** `components/page-shell.tsx`
- **Relevance:** Shared header in `MyJobsLayoutShell` — title, description, Post a job action

### app/(app)/my-jobs/page.tsx

- **Location:** `app/(app)/my-jobs/page.tsx`
- **Relevance:** Update to redirect to `/my-jobs/created`

### lib/nav.ts

- **Location:** `lib/nav.ts`
- **Relevance:** Sidebar entry points to `/my-jobs` — no change needed; redirect handles sub-routes

---

## Prior Specs

### My Jobs Management Pages

- **Location:** `agent-os/specs/2026-08-04-1556-my-jobs-management-pages/`
- **Relevance:** Built `/my-jobs` created list; applications tab was deferred — this spec adds it

### Account Profile Preview Layout

- **Location:** `agent-os/specs/2026-07-30-2017-account-profile-preview-layout/`
- **Relevance:** AccountNav tab pattern and layout shell reference

### Jobs Backend

- **Location:** `agent-os/specs/2026-07-26-2207-jobs-backend/`
- **Relevance:** Original `job_applications` schema, apply API, and board wiring
