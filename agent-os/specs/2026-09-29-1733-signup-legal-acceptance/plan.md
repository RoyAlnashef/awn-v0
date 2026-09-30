# Signup legal acceptance step

Add a fourth wizard step (after Social links) to both Request Access and invite Apply flows: four required checkboxes with linked titles, custom one-line summaries, and persistence via the existing `acceptLegalDocuments` action after sign-in so the post-login gate stays satisfied.

See shaping notes in `shape.md` and implementation references in `references.md`.

## Tasks

1. Save spec documentation (this folder)
2. Extend `lib/legal/documents.ts` with `href` + `signupSummary`
3. Build `components/legal/legal-signup-acceptance.tsx`
4. Fourth step + stepper fix in `apply-form-steps.tsx`
5. Wire `ApplyForm` step machine + post-sign-in acceptance
6. Manual verification
