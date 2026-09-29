# One-Step Job Apply — Shaping Notes

## Scope

Remove the pre-apply "Apply to..." form dialog (resume upload + optional note). Clicking **Apply** on the job board card, job row, or job detail footer submits the application immediately. Repurpose the dialog as a post-apply **Application sent** confirmation with **Withdraw** (undo) and **Done**.

## Decisions

- Drop the optional application **note** entirely; recruiters use the applicant profile card.
- Resume continues to be attached server-side from `profiles.resume_url` on apply.
- Success dialog includes withdraw using existing `DELETE /api/jobs/[id]/apply` / `withdrawFromJob`.
- No API or schema changes.

## Context

- **Visuals:** `visuals/apply-form-dialog-before.png`, `visuals/job-card-apply.png`, `visuals/job-detail-footer-apply.png`
- **References:** `components/jobs/apply-job-dialog.tsx` (replaced), `components/jobs/my-application-row.tsx` (withdraw pattern), `app/api/jobs/[id]/apply/route.ts`
- **Product alignment:** N/A (no agent-os/product docs referenced)

## Standards Applied

- N/A — `agent-os/standards/index.yml` is empty for this work.
