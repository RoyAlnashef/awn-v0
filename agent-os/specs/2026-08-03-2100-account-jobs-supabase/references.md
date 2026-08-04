# References for Account Jobs

## Similar Implementations

### Account Jobs UI (mock)

- **Location:** `components/account/jobs-section.tsx`
- **Relevance:** Target component to wire
- **Key patterns:** Created/Saved tabs, account-specific JobCard layout

### PostJobDialog

- **Location:** `components/jobs/post-job-dialog.tsx`
- **Relevance:** Reuse for create/edit on account page
- **Key patterns:** Form fields, createJob POST, SWR revalidation

### Jobs API routes

- **Location:** `app/api/jobs/route.ts`, `app/api/jobs/[id]/route.ts`, `app/api/jobs/[id]/save/route.ts`
- **Relevance:** List/create, PATCH edit, save toggle
- **Key patterns:** requireApiUser, mapJobPostingRow

### Jobs client layer

- **Location:** `lib/jobs/fetch.ts`, `lib/jobs/map.ts`, `lib/jobs/swr-keys.ts`
- **Relevance:** SWR fetchers and mappers to extend

### Jobs backend spec

- **Location:** `agent-os/specs/2026-07-26-2207-jobs-backend/`
- **Relevance:** Original schema and API design
