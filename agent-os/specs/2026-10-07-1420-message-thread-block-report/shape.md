# Message thread block and report — Shaping Notes

## Scope

Add Block and Report to the direct-message thread header via an ellipsis dropdown. Report opens in a dialog on desktop and a bottom drawer on mobile. Reuses existing moderation server actions; profile/job card footers unchanged.

## Decisions

- Thread header menu: **Block** and **Report** only (not inbox mute/archive/delete).
- Report UI: **thread-only** popover-style dialog / drawer; profile cards keep footer slide-up.
- After report submit: toast thank-you (no inline thanks step).
- Visibility: persisted conversations with `otherProfileId` only.

## Context

- **Visuals:** thread-header-context, inbox-ellipsis-reference, report-form-dialog, block-confirmation, mobile-drawer-reference (in `visuals/`).
- **References:** `conversation-actions-dropdown.tsx`, `person-profile-interactive-footer.tsx`, `nav-user.tsx`, `message-thread.tsx`.
- **Product alignment:** Member safety / trust model; extends `2026-10-01-1807-member-report-block`.

## Standards Applied

- `css/shadcn-ui` — DropdownMenu, Dialog, Drawer, AlertDialog, Select
- `css/design-tokens` — semantic tokens only
