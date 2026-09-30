# Standards for Signup Legal Acceptance

`agent-os/standards/index.yml` is currently empty, so no formal standards are registered.

## Conventions applied

- **Server actions:** Reuse `acceptLegalDocuments` in `lib/legal/actions.ts` with auth checked inside the action; versions resolved server-side from `lib/legal/documents.ts`.
- **Single registry:** Keys, titles, hrefs, signup summaries, and versions live in one module shared with the post-login gate.
- **UI:** `components/ui/field.tsx` + `components/ui/checkbox.tsx`; Next.js `Link` for marketing routes.
- **Migrations:** No schema change; reuse `legal_acceptances` from the legal acceptance gate migration.
