# References for My Jobs Management Pages

## Layout Reference

### account-layout-shell.tsx

- **Location:** `components/account/account-layout-shell.tsx`
- **Relevance:** Two-column 12-col grid (7-col content left + 5-col preview right) that the job pages replicate
- **Key patterns:** `lg:grid-cols-12`, `lg:col-span-7`, `lg:col-span-5`, aside styling with `bg-card/20 rounded-4xl`

---

## Existing Jobs UI

### post-job-dialog.tsx

- **Location:** `components/jobs/post-job-dialog.tsx`
- **Relevance:** Source of all form fields to migrate to `job-form-page.tsx`
- **Key patterns:** Role, production, department, location, engagement type, compensation, description, dates, urgency toggle; `createJob()` submit; draft/open footer actions

### jobs-board.tsx

- **Location:** `components/jobs/jobs-board.tsx`
- **Relevance:** Public board pattern — filter state, SWR fetch, grid/list toggle, empty state
- **Key patterns:** Board + Filters composition; `useJobs` SWR hook

### job-card.tsx

- **Location:** `components/jobs/job-card.tsx`
- **Relevance:** Job card component used as the live preview in the right column of `job-form-page.tsx` and `job-management-detail.tsx`

### job-detail-drawer.tsx

- **Location:** `components/jobs/job-detail-drawer.tsx`
- **Relevance:** Non-poster detail view pattern; may be reused or referenced for the public view of `/jobs/[id]`

### jobs-filters.tsx

- **Location:** `components/jobs/jobs-filters.tsx`
- **Relevance:** Filter bar pattern for `my-jobs-board.tsx` if filtering is needed

---

## API Routes

### GET/POST /api/jobs

- **Location:** `app/api/jobs/route.ts`
- **Relevance:** List + create pattern; `POST` extended to accept `status: "draft" | "open"` for form-page submit and duplicate action

### GET/PATCH/DELETE /api/jobs/[id]

- **Location:** `app/api/jobs/[id]/route.ts`
- **Relevance:** PATCH already accepts `{ status }` — used for Pause (`status: "draft"`) and Unpause (`status: "open"`); GET to be extended with `view_count` increment logic

### GET /api/jobs/mine

- **Location:** `app/api/jobs/mine/route.ts`
- **Relevance:** `tab=created` endpoint used by `my-jobs-board.tsx` SWR fetch

---

## Library Helpers

### lib/jobs/fetch.ts

- **Location:** `lib/jobs/fetch.ts`
- **Relevance:** `createJob`, `updateJob`, `fetchMyJobs` client helpers; extend with `fetchJobApplications(jobId)`

### lib/jobs/swr-keys.ts

- **Location:** `lib/jobs/swr-keys.ts`
- **Relevance:** SWR key factory functions; add `jobApplicationsKey(jobId)`

### lib/jobs/map.ts

- **Location:** `lib/jobs/map.ts`
- **Relevance:** `mapJobPostingRow`; extend to pass through `view_count` → `viewCount`

### lib/jobs-data.ts

- **Location:** `lib/jobs-data.ts`
- **Relevance:** `JobPostingRow`, `Job`, `JobStatus` types; add `view_count` / `viewCount`

### lib/nav.ts

- **Location:** `lib/nav.ts`
- **Relevance:** `mainNav` — add My Jobs entry with `Briefcase` icon and `/my-jobs` href

---

## Account Components

### account-nav.tsx

- **Location:** `components/account/account-nav.tsx`
- **Relevance:** Remove Jobs tab entry as part of cleanup

### jobs-section.tsx

- **Location:** `components/account/jobs-section.tsx`
- **Relevance:** Repurpose as saved-jobs-only view or retire; remove `PostJobDialog` usage

---

## Prior Specs

### Account Jobs — Supabase Wiring

- **Location:** `agent-os/specs/2026-08-03-2100-account-jobs-supabase/`
- **Relevance:** Established draft status, `/api/jobs/mine`, and `PostJobDialog` edit mode patterns; this spec supersedes the `/account/jobs` sub-page

### Jobs Backend

- **Location:** `agent-os/specs/2026-07-26-2207-jobs-backend/`
- **Relevance:** Original DB schema, RLS, and REST API implementation

### Account Profile Preview Layout

- **Location:** `agent-os/specs/2026-07-30-2017-account-profile-preview-layout/`
- **Relevance:** Two-column layout implementation reference used as the pattern for job form and detail pages
