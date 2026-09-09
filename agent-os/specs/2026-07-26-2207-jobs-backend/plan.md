# Jobs Backend + Wiring

## Task 1: Save Spec Documentation

Create `agent-os/specs/2026-07-26-2207-jobs-backend/` with plan, shape, standards, references, and visuals.

## Task 2: Database Migration

`supabase/migrations/20260726100000_create_jobs_tables.sql` — enums, `job_postings`, `job_applications`, `saved_jobs`, RLS.

## Task 3: TypeScript Types

Update `lib/jobs-data.ts` with DB-aligned types; add `lib/jobs/` helpers (map, swr-keys, fetch).

## Task 4: API Routes

- `GET/POST app/api/jobs/route.ts`
- `GET/PATCH/DELETE app/api/jobs/[id]/route.ts`
- `POST/DELETE app/api/jobs/[id]/apply/route.ts`
- `POST app/api/jobs/[id]/save/route.ts`

## Task 5: UI Wiring

- `jobs-board.tsx` — SWR fetch from `/api/jobs`
- `post-job-dialog.tsx` — kind toggle + POST submit
- `apply-job-dialog.tsx` — new apply modal
- `job-card.tsx` / `job-row.tsx` — apply + save wired

## Deferred

- Urgent job callout styling on jobs page
- My Posts / applicant review
- Job alerts / notifications
