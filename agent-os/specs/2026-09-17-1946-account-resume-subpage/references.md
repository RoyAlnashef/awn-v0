# References for Account Resume Sub-page

## Similar Implementations

### Profile resume server actions

- **Location:** `lib/account/profile-actions.ts`
- **Relevance:** Existing `uploadProfileResume`, `getProfileResumeSignedUrl`; extend with `removeProfileResume`
- **Key patterns:** Private `resumes` bucket, path stored in `profiles.resume_url`, signed URLs for preview

### Apply job dialog resume upload

- **Location:** `components/jobs/apply-job-dialog.tsx`
- **Relevance:** Resume state machine (loading / missing / uploading / error / ready)
- **Key patterns:** FormData with `"resume"` key, toast on success/error

### Application review resume preview

- **Location:** `components/applications/application-review-panel.tsx`
- **Relevance:** iframe PDF preview + View link in new tab
- **Key patterns:** `h-[min(50vh,480px)]` iframe, ghost View button with ExternalLink icon

### Account section layout

- **Location:** `components/account/tour-credits-section.tsx`
- **Relevance:** Section heading, card container, toast feedback
- **Key patterns:** `font-heading text-base font-semibold` section titles

### Account navigation

- **Location:** `components/account/account-nav.tsx`
- **Relevance:** Tab registration via `NAV_ITEMS` constant
- **Key patterns:** File-based routes, `usePathname()` for active state

### Prior resume spec

- **Location:** `agent-os/specs/2026-09-10-1819-resume-in-job-applications/`
- **Relevance:** Documents resume bucket, profile columns, and job application integration
