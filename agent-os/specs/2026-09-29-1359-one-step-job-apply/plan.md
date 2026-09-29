# One-Step Job Apply

## Goal

Remove the "Apply to..." form dialog so clicking **Apply** submits in one click. Repurpose the dialog into a post-apply success confirmation with withdraw/undo.

## Confirmed decisions

- Drop optional **Note**; call `applyToJob(id, {})`.
- Resume auto-attached server-side from profile.
- Success dialog: **Withdraw** + **Done**.
- No API changes.

## Behavior

- **Apply click** → `applyToJob(job.id, {})`, disable while pending, on success `applied=true`, revalidate, open success dialog.
- **Success dialog** → "Application sent" + **Withdraw** / **Done**.

## Files changed

1. `components/jobs/application-sent-dialog.tsx` (replaces `apply-job-dialog.tsx`)
2. `components/jobs/job-card.tsx`
3. `components/jobs/job-row.tsx`
4. `components/jobs/job-detail-content.tsx`

## Notes

- Preview mode in job detail unchanged.
- `ApplyJobPayload.note` and routes untouched.
