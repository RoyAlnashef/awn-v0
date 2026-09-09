# References for Jobs Urgent Wiring

## Similar Implementations

### Jobs backend (original)

- **Location:** `agent-os/specs/2026-07-26-2207-jobs-backend/`
- **Relevance:** Established `kind`, `expires_at`, POST create flow
- **Key patterns:** Supabase schema, REST routes, SWR wiring

### Account jobs Supabase wiring

- **Location:** `agent-os/specs/2026-08-03-2100-account-jobs-supabase/`
- **Relevance:** PATCH edit flow, draft status, form page patterns
- **Key patterns:** `UpdateJobPayload`, `job-form-page.tsx`

### POST create — kind / expires_at

- **Location:** `app/api/jobs/route.ts` (lines 226–252)
- **Relevance:** Canonical logic for urgent expiry on create
- **Key patterns:** `kind === "urgent"` → 48h `expires_at`, clear deadline

### PATCH handler (extend)

- **Location:** `app/api/jobs/[id]/route.ts`
- **Relevance:** Target for kind persistence on edit

### JobRow — Urgent badge UI

- **Location:** `components/jobs/job-row.tsx`
- **Relevance:** Canonical badge layout to mirror on `JobCard`

### JobDetailContent — detail / preview

- **Location:** `components/jobs/job-detail-content.tsx`
- **Relevance:** Preview panel badges and deadline chips

### Job form page

- **Location:** `components/jobs/job-form-page.tsx`
- **Relevance:** Already sends `kind` via `buildPayload`; drives live preview
