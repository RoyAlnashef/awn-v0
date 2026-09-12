# References for Job Status Dropdown

## Similar Implementations

### JobManagementDetail (target page)

- **Location:** `components/jobs/job-management-detail.tsx`
- **Relevance:** Page header actions slot and current status badge in body
- **Key patterns:** `JobPageLayout` `actions` prop; application status update with `useTransition` + toast

### MyJobRow (Pause action)

- **Location:** `components/jobs/my-job-row.tsx`
- **Relevance:** Existing pause flow sets `status: "draft"` via `updateJob()`
- **Key patterns:** Toast copy "Job paused — hidden from the board"

### Select usage in forms

- **Location:** `components/users/invite-user-dialog.tsx`, `components/jobs/job-form-page.tsx`
- **Relevance:** shadcn Select with `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`
- **Key patterns:** Controlled value + `onValueChange`

### Job status styling

- **Location:** `lib/jobs/format.ts`, `components/jobs/job-status-badge.tsx`
- **Relevance:** Existing `jobStatusStyles` map for badge colors
- **Key patterns:** Capitalize status in badge; new `jobStatusLabels` for human-readable names

### API status patch

- **Location:** `app/api/jobs/[id]/route.ts`
- **Relevance:** PATCH accepts `status`; sets `filled_at` on filled, resets `expires_at` for urgent open
- **Key patterns:** Poster-only authorization already enforced
