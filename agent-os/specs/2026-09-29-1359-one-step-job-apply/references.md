# References for One-Step Job Apply

## Similar Implementations

### Apply API (server resume attach)

- **Location:** `app/api/jobs/[id]/apply/route.ts`
- **Relevance:** POST apply reads `profile.resume_url` and stores on `job_applications`; note is optional and may be empty.
- **Key patterns:** No client resume upload required for apply to succeed.

### Withdraw from My Applications

- **Location:** `components/jobs/my-application-row.tsx`
- **Relevance:** `withdrawFromJob`, toast, SWR revalidation for jobs list and my applications.
- **Key patterns:** Confirm/execute withdraw; mutate keys starting with `jobsListKey`.

### Job apply callers (before change)

- **Location:** `components/jobs/job-card.tsx`, `components/jobs/job-row.tsx`, `components/jobs/job-detail-content.tsx`
- **Relevance:** All opened `ApplyJobDialog` on Apply click.
- **Key patterns:** Local `applied` state, `onApplied` callback, `revalidateJobs()`.

### Client fetch helpers

- **Location:** `lib/jobs/fetch.ts`
- **Relevance:** `applyToJob(jobId, payload)`, `withdrawFromJob(jobId)`.
