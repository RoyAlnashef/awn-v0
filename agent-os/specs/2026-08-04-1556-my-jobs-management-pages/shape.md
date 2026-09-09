# My Jobs Management Pages — Shaping Notes

## Scope

Replace the `/account/jobs` sub-page and `PostJobDialog` modal with three first-class full-page routes:

1. **`/my-jobs`** — list of the user's posted jobs with engagement stats (views, applications) and inline management actions (edit, pause, duplicate)
2. **`/jobs/new` + `/jobs/[id]/edit`** — full-page create/edit form with a live `<JobCard>` preview in the right column
3. **`/jobs/[id]`** — poster-only management detail page with analytics stat cards, applicant list, and `<JobCard>` preview

## Decisions

- **Layout:** Two-column 12-col grid (7-col content left + 5-col preview right), mirroring `account-layout-shell.tsx` — no new layout primitive needed
- **PostJobDialog retired:** Modal flow replaced by `/jobs/new`; all "Post a job" CTAs across the app navigate there instead
- **`/account/jobs` deleted:** Replaced by `/my-jobs`; Jobs tab removed from `AccountNav`
- **`view_count` column added:** New `integer NOT NULL DEFAULT 0` column on `job_postings` for analytics display; incremented on non-poster `GET /api/jobs/[id]` fetch
- **Applications endpoint:** New `GET /api/jobs/[id]/applications` — poster-only, joins `job_applications` with `profiles`
- **Pause = draft:** Pause action PATCHes `{ status: "draft" }` on existing PATCH route
- **Duplicate:** POST new job with existing fields + `status: "draft"` → redirect to edit
- **Reuse existing REST + SWR stack:** Consistent with [`lib/jobs/fetch.ts`](lib/jobs/fetch.ts) patterns; no server actions

## Context

- **Visuals:** Screenshots in `visuals/` (current `/jobs` board, account layout reference, `PostJobDialog` modal)
- **References:** See `references.md` — account-layout-shell, post-job-dialog, jobs-board, jobs API routes, lib/jobs helpers
- **Product alignment:** Jobs are central to AWN's employer/crew marketplace. Full-page management elevates job posting to a first-class experience alongside profile and rooms management.

## Prior Art

- [`agent-os/specs/2026-08-03-2100-account-jobs-supabase/`](../2026-08-03-2100-account-jobs-supabase/) — wired Created + Saved tabs, PostJobDialog draft support; this spec supersedes the `/account/jobs` sub-page work
- [`agent-os/specs/2026-07-26-2207-jobs-backend/`](../2026-07-26-2207-jobs-backend/) — original jobs DB + API + board wiring

## Standards Applied

- `global/page-shell` — all new routes use `PageShell`
- `global/sidebar-nav` — My Jobs added to `mainNav` in `lib/nav.ts`
- `global/board-pattern` — `MyJobsBoard` follows Board composition pattern
- `css/shadcn-ui` — form fields from `@/components/ui/*`
- `css/design-tokens` — semantic Tailwind tokens throughout
