# DM Inbox and Thread Actions — Shaping Notes

## Scope

Expand 1:1 messaging with inbox hygiene and per-user delete, mirroring Groups inbox UX:

- Archive thread (Archived section; unarchive on new message)
- Mute / unmute thread
- Mark thread unread
- Delete thread for me (hide history + inbox row; re-open as fresh thread)
- Delete received message bubble for me (keep Unsend for own messages)

## Decisions

- **Placement:** Inbox row 3-dot only (like Groups). No thread-header menu.
- **Mute:** `dm_participants.muted_at`; suppress badges and push like Groups.
- **Archive:** `archived_at`; new message clears archive and returns to main inbox.
- **Delete thread:** `cleared_at` + `hidden_at`; no auto-resurrect on inbound; opening conversation clears `hidden_at` only.
- **Delete bubble:** Received only; Unsend unchanged for own messages.
- **Delete thread:** AlertDialog confirmation (unlike Groups Leave).

## Context

- **Visuals:** `visuals/` — Messages inbox, Groups Mute/Leave/Unmute references
- **References:** `room-actions-dropdown.tsx`, `rooms-inbox.tsx`, DM unsend/reply specs
- **Product alignment:** Phase 1 Messages inbox hygiene; mute matches Groups behavior

## Standards Applied

- `css/design-tokens` — semantic tokens for destructive actions
- `css/shadcn-ui` — DropdownMenu, AlertDialog, Button
- `global/page-shell` — messages page already uses split-pane exception
- `global/sidebar-nav` — DM unread badge via `get_dm_unread_count`
