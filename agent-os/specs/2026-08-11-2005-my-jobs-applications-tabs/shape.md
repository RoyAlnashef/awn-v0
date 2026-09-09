# My Jobs Applications Tabs — Shaping Notes

## Scope

Extend the existing `/my-jobs` page with path-based tab navigation so users can switch between:

1. **`/my-jobs/created`** — jobs the user has posted (existing `MyJobsBoard` content, refactored into `CreatedJobsSection`)
2. **`/my-jobs/applications`** — jobs the user has applied to, with application status and withdraw action

The root `/my-jobs` route redirects to `/my-jobs/created` so existing sidebar and nav links keep working.

## Decisions

### Tab navigation

- **Pattern:** Clone [`AccountNav`](components/account/account-nav.tsx) as `MyJobsNav` — pill buttons on desktop (`secondary` active, `outline` inactive), `NativeSelect` dropdown on mobile
- **Tab labels:** "My Jobs" and "My Applications"
- **Routes:** `/my-jobs/created` and `/my-jobs/applications` (path-based, not query params)
- **Layout shell:** `MyJobsLayoutShell` wraps both tabs with shared `PageShell` header (title, description, Post a job CTA) and nav; no Account-style preview column

### Applications list

- **Data source:** Extend `GET /api/jobs/mine?tab=applied` — query `job_applications` where `applicant_id = user.id` and `status != 'withdrawn'`, join job + poster
- **Card content:** Job details (reuse `MyJobListItem` / `JobCard` visual language) plus application status badge and "Applied {relative date}"
- **Status badge:** Read-only for applicants; use existing [`applicationStatusStyles`](lib/jobs/format.ts) (`pending`, `approved`, `maybe`, `declined`)

### Withdraw action

- **API:** Existing `DELETE /api/jobs/[id]/apply` — sets application status to `withdrawn`; no new endpoint
- **Client:** `withdrawFromJob(jobId)` in `lib/jobs/fetch.ts`
- **UX:** Confirm dialog before withdraw; on success, `mutate(myApplicationsKey)` and toast; card removed from list

### View job details

- **Applicant view:** Card click opens existing [`JobDetailDrawer`](components/jobs/job-detail-drawer.tsx) for read-only job details
- **Not** `/jobs/[id]` — that route is poster-only management (analytics, applicants list)

## Context

- **Visuals:** Screenshots in `visuals/` — current My Jobs created grid, Account tab nav reference
- **References:** See `references.md` — AccountNav, MyJobsBoard, apply route, job-detail-drawer
- **Product alignment:** Roadmap "apply with profile, employer shortlist" — applicants need a place to track submissions

## Prior Art

- [`agent-os/specs/2026-08-04-1556-my-jobs-management-pages/`](../2026-08-04-1556-my-jobs-management-pages/) — built `/my-jobs` created jobs list; applications tab deferred as out of scope
- [`agent-os/specs/2026-07-30-2017-account-profile-preview-layout/`](../2026-07-30-2017-account-profile-preview-layout/) — AccountNav tab pattern reference
- [`agent-os/specs/2026-07-26-2207-jobs-backend/`](../2026-07-26-2207-jobs-backend/) — original jobs DB, apply API, and board wiring

## Standards Applied

- `global/page-shell` — shared header in `MyJobsLayoutShell`
- `global/board-pattern` — grid, skeletons, dashed empty states for both sections
- `css/shadcn-ui` — Button, NativeSelect, Drawer, confirm dialog from `@/components/ui/*`

## Out of Scope

- Poster-side accept/reject of applications (status updates remain read-only badge for applicants)
- Saved jobs tab (`tab=saved` API exists but not requested)
- Special re-apply UI after withdraw (user can apply again from public jobs board)
