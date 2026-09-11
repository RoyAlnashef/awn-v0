# References — Resume in Job Applications

## Membership Resume Upload
- **Location:** `lib/applications/actions.ts`
- **Relevance:** Existing resume upload to the `resumes` Supabase Storage bucket. Contains the validated upload helper (`uploadResume`), signed URL generation (`getApplicationResumeSignedUrl`), and the path convention `{applicationId}/resume.pdf`.
- **Key patterns to borrow:** MIME/size validation, admin client upload with `upsert: true`, signed URL generation, `actionError()` helper pattern.

## Banner Upload (Profile)
- **Location:** `lib/account/profile-actions.ts`
- **Relevance:** Server action that uploads a file to a private bucket and updates a `profiles` column. Closest match to what `uploadProfileResume` needs to do.
- **Key patterns to borrow:** Server action structure, `revalidatePath`, `requireProfileEditor` auth pattern, public/path URL construction.

## Apply Dialog
- **Location:** `components/jobs/apply-job-dialog.tsx`
- **Relevance:** The form being extended. Currently note-only; will gain resume attachment preview and upload prompt sections.

## Applications List API
- **Location:** `app/api/jobs/[id]/applications/route.ts`
- **Relevance:** Employer-facing endpoint that returns applicant data. Will be extended to include `resume_url` from `job_applications`.

## Attachment UI Component
- **Location:** `components/ui/attachment.tsx`
- **Relevance:** Already-installed shadcn component for displaying file attachments with states (`idle`, `uploading`, `done`, `error`). Will be used in the apply dialog to preview the resume.
- **Usage:** `<Attachment state="done"><AttachmentMedia><FileTextIcon /></AttachmentMedia><AttachmentContent>...</AttachmentContent></Attachment>`
