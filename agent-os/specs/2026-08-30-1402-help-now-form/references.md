# References for Help Now Form

## Similar Implementations

### Job form page (current urgent mode)

- **Location:** `components/jobs/job-form-page.tsx`
- **Relevance:** Posting type toggle; will embed `HelpNowForm` when kind=urgent
- **Key patterns:** `createJob` / `updateJob`, live preview via `formToPreviewJob`

### Apply job dialog

- **Location:** `components/jobs/apply-job-dialog.tsx`
- **Relevance:** Dialog + form submit + toast pattern
- **Key patterns:** Controlled open state, reset on close, SWR-free (caller revalidates)

### Invite user dialog

- **Location:** `components/users/invite-user-dialog.tsx`
- **Relevance:** Uppercase field labels, dialog footer layout
- **Key patterns:** `FieldLabel` with tracking-wide uppercase styling

### Urgent jobs wiring

- **Location:** `agent-os/specs/2026-08-13-1830-jobs-urgent-wiring/`
- **Relevance:** 48h TTL, kind transitions, urgent badge styling
- **Key patterns:** `lib/jobs/kind.ts`, `urgentApplyButtonStyles`

### Header jobs panel

- **Location:** `components/jobs/jobs-panel/urgent-jobs-carousel.tsx`
- **Relevance:** Revalidate `urgentJobsKey` after posting Help Now
