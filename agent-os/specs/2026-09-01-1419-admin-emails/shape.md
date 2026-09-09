# Admin Emails — Shaping Notes

## Scope

Build an admin Emails section at `/email` with two sub-pages:

1. **Templates** — catalog of all AWN emails (Resend app + Supabase Auth), searchable list, live HTML preview, copy Supabase Go-tagged HTML for Dashboard paste.
2. **Broadcast** — compose subject + body, audience filters (role/status), test send, broadcast to members, send history.

## Decisions

- **Broadcast audience:** All active members by default; optional role and status filters.
- **Broadcast workflow:** Compose → preview → test to self → send + persist send history (no drafts/scheduling in v1).
- **Supabase catalog:** Magic Link, Password Recovery, Confirm Signup, Invite User, Email Change, Reauthentication.
- **Design pattern:** 7/5 split layout from Account and Job forms.
- **Standards:** page-shell, sidebar-nav, design-tokens, shadcn-ui.

## Context

- **Visuals:** `visuals/account-profile-reference.jpg`, `job-edit-reference.png`, `job-detail-reference.png`
- **References:** `AccountLayoutShell`, `JobPageLayout`, `lib/email/templates/base.ts`
- **Product alignment:** Admin broadcast emails on Phase 1 roadmap; Resend in tech stack

## Standards Applied

- global/page-shell — Emails pages use PageShell with nav title/description
- global/sidebar-nav — `/email` in adminNav
- css/design-tokens — semantic Tailwind tokens
- css/shadcn-ui — forms, dialogs from `@/components/ui/*`
