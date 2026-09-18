# Account Resume Sub-page — Shaping Notes

## Scope

Add a **Resume** sub-page under My Account where members can upload, preview, replace, and remove their profile resume. Backend storage already exists; this work is UI plus a `removeProfileResume` server action.

## Decisions

- **UX:** Compact upload bar at top + full preview below when a resume exists. Replace via the bar or preview actions; Remove from preview actions.
- **File constraints:** PDF only, max 5 MB (matches existing backend).
- **Preview:** Browser iframe with Supabase signed URL (10 min TTL), same as application review panel.
- **No new migration:** Reuse `profiles.resume_url`, `profiles.resume_filename`, and `resumes` bucket.

## Context

- **Visuals:** `visuals/account-tabs-mockup.png`, `visuals/resume-preview-mockup.png`, `visuals/dropzone-mockup.png`
- **References:** `lib/account/profile-actions.ts`, `components/jobs/apply-job-dialog.tsx`, `components/applications/application-review-panel.tsx`, `components/account/tour-credits-section.tsx`
- **Product alignment:** Supabase Storage for resumes per `agent-os/product/tech-stack.md`

## Standards Applied

- global/page-shell — account pages use shared AccountLayoutShell
- css/shadcn-ui — compose from `@/components/ui/*`
- css/design-tokens — semantic Tailwind tokens, no hard-coded colors
