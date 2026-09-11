# Resume in Job Applications — Shaping Notes

## Scope

Add resume support across the job application lifecycle:
1. **Applicant side** — When opening the "Apply to [Job]" dialog, auto-show the user's saved resume as an `Attachment` component preview. If no resume is on file, prompt them to upload one inline. The upload saves to `profiles.resume_url` (persisted for all future applications) and is included with the submission.
2. **Employer side** — In the job management detail view (applicant list), add a "View Resume" link per applicant that opens their resume PDF in a new browser tab.

## Decisions

- **Shared `resumes` bucket** — Re-use the existing private `resumes` Supabase Storage bucket. Membership application resumes live at `{applicationId}/resume.pdf`; user profile resumes will use `users/{userId}/resume.pdf` to avoid collisions.
- **Store path, not URL** — `profiles.resume_url` stores the storage path (`users/{userId}/resume.pdf`). Signed URLs (10 min TTL) are generated on demand via server actions.
- **Upload first, apply second** — Resume upload is a separate step that saves to the user profile. The resulting path is then passed as `resumeUrl` in the apply payload, which gets stored on `job_applications.resume_url`.
- **Signed URLs for employer** — Since the bucket is private, employer resume links go through a server action (`getJobApplicationResumeSignedUrl`) that verifies the caller is the job poster before generating a signed URL.
- **Attachment UI** — The `Attachment` shadcn/ui component is already installed. No new install needed.

## Context

- **Visuals:** Screenshots provided showing the apply dialog modal and employer job detail view with applicant list.
- **References:** Membership application resume upload in `lib/applications/actions.ts`; banner upload pattern in `lib/account/profile-actions.ts`; apply dialog in `components/jobs/apply-job-dialog.tsx`
- **Product alignment:** Resume on profile is a planned feature noted in product notes ("Upload CV/resume for crew profiles") — this implements it as part of the jobs flow.

## Standards Applied

- Server action auth: all server actions verify session before proceeding
- File upload: validate MIME type (`application/pdf`) and size (≤5MB) before upload
- Signed URLs: private bucket objects always served via time-limited signed URLs
