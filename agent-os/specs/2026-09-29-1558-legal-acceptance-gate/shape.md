# Legal Acceptance Gate — Shaping Notes

## Scope

Collect confirmations from users that they accept the four legal/conduct documents (Community Guidelines, Terms of Service, Privacy Policy, Job Posting Policy). Since acceptance is not collected at signup today, gate the authenticated app on next login: if a user hasn't accepted the current version of every document, present a large blocking tabbed dialog. Each section must be scrolled to the bottom before it can be accepted. Community Guidelines shows first (priority). Once all outstanding documents are accepted, the gate disappears.

## Decisions

- **Version-aware tracking.** Store the accepted `version` per document in a dedicated `legal_acceptances` table (one row per profile + document, upserted). Re-prompt only when a document's current version changes. Chosen over a single one-time flag so updated documents can be re-surfaced, and over profile columns so we keep an audit trail (`accepted_at`) and can add documents without schema churn.
- **All four required for every user; blocking / non-dismissible.** Every member must accept all four. The dialog is modal, has no close button, and ignores outside-press / Escape (`disablePointerDismissal`, guarded `onOpenChange`). The app is unusable until acceptance completes.
- **App-layout gate, server-checked.** `getOutstandingLegalDocuments()` runs in `app/(app)/layout.tsx` so any authenticated route triggers the overlay immediately after login. Reads use the cookie-based `createClient()` under RLS.
- **Show only outstanding.** When only a subset of docs need (re)acceptance (e.g. one doc's version bumped), only those tabs render; the default tab is the first outstanding doc (Community Guidelines when present).
- **Version string = `lastUpdated`.** Each `LegalDocument.lastUpdated` doubles as its version. The server resolves the version from the registry, never trusting a client-supplied version.
- **Reuse existing content.** The four documents already exist as structured data in `components/legal/content.ts`; no need to fetch the awrightnetwork.com URLs. Reuse `LegalDocumentView` to render section text.

## Context

- **Visuals:** None provided.
- **References:** see `references.md`.
- **Product alignment:** Supports the "Post-approval onboarding: first-login flow gating" direction — this slice adds legal/conduct acceptance gating.

## Standards Applied

`agent-os/standards/index.yml` is currently empty, so no standards are formally registered. UI follows existing conventions: `@base-ui/react` shadcn primitives (`Dialog`, `Tabs`, `Button`), semantic design tokens, server actions with auth checks inside, and manual-run Supabase migrations.
