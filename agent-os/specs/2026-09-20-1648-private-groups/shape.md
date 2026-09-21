# Private Groups — Shaping Notes

## Scope

Admins can mark community groups as **private** at create or edit time, optionally add a **note** shown to non-members, and manage membership through a new **Group Members** drawer. Members must **request to join** private groups; admins approve/deny in the drawer or remove existing members. Non-members see a **hidden state** (no message preview) until approved. Admins receive **in-app notifications** for new join requests.

## Decisions

- Message visibility (private, non-member): Hidden state only — no message preview until approved
- Admin notifications: Yes — notify admins on new join requests
- Privacy editing: Create and edit — privacy + note editable anytime
- Auto-join + private: Mutually exclusive (private disables auto-join)

## Context

- **Visuals:** 6 screenshots in `visuals/` (groups list, manage table, create modal, public join state, request-to-join mockups)
- **References:** rooms-table, create/edit dialogs, drawer stack, PersonProfileDrawer, ApplicationReviewPanel, notifications actions
- **Product alignment:** Extends AWN's invite-only trust model to discipline-specific community rooms

## Standards Applied

- global/page-shell — Settings page keeps PageShell wrapper
- css/shadcn-ui — Drawer, Dialog, Switch, Textarea from ui primitives
- css/design-tokens — Semantic tokens for badges and muted text
- global/board-pattern — Member list rows follow picker/list patterns
