# Jobs Backend + Wiring — Shaping Notes

## Scope

Wire the existing Jobs UI (browse, filters, grid/list, post dialog, job cards) to a real Supabase backend. Supports two posting kinds via a single `job_postings` table: **full** long-form roles and **urgent** Help Now-style callouts (48h TTL). Apply and save actions get wired; urgent visual callouts on the jobs page are deferred.

## Decisions

- **Single table with `kind` column** — `full | urgent` rather than separate Help Now table (shared browse/apply/save API)
- **Urgent TTL** — `expires_at = now() + 48h` set on create; list query excludes expired urgent posts
- **Rate as free text** — matches existing UI (`pay_rate` text field)
- **Department derived from role** — `departmentByRole` lookup on create, stored denormalized for filtering
- **Soft delete** — `status = deleted` via PATCH/DELETE; list shows only `open` jobs passing deadline/expiry checks
- **API routes** — REST handlers under `app/api/jobs/` (plan spec); SWR on client for list revalidation
- **Deferred** — urgent callout UI, My Posts, applicant review, job alerts, notifications

## Context

- **Visuals:** Jobs grid/list + post dialog screenshots in `visuals/`
- **References:** `lib/jobs-data.ts`, `components/jobs/*`, DM/rooms migration RLS patterns
- **Product alignment:** P1 Jobs in migration inventory — browse + post + apply foundation before alerts/shortlist

## Standards Applied

- `global/board-pattern` — preserve existing filter + grid/list board UX
- `global/page-shell` — jobs page shell unchanged
- Supabase migration convention — manual-only header, enums, RLS, indexes
