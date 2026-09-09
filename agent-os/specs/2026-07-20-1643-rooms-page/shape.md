# Rooms Page — Shaping Notes

## Scope

Move community **Rooms** out of the Messages internal nav and header sheet into a first-class sidebar page at `/rooms`. The new page duplicates the Messages split-pane layout (room list + chat thread) using the same chat UI primitives. Unjoined rooms show a **read-only message preview** with a **Join CTA** to participate.

## Decisions

- Sidebar placement: `mainNav`, directly after Messages
- Unjoined room UX: Read-only transcript preview + Join CTA (no composer until joined)
- Layout pattern: Match Messages full-height chat shell, not default `PageShell` empty placeholder
- Data: Extend existing mock data in `lib/messages-data.ts`
- No header Rooms sheet — only remove Rooms from the Messages drawer

## Context

- **Visuals:** messages-direct-tab.png, messages-rooms-tab.png, messages-header-sheet.png, groups-admin-page.png
- **References:** Messages page/view/inbox/thread components, `lib/messages-data.ts`, `lib/nav.ts`
- **Product alignment:** Rooms are member-facing discipline channels (~14 curated), separate from admin Groups management. Join/leave freely; improves discoverability vs burying under Messages.

## Standards Applied

- sidebar-nav — Add Rooms to `mainNav`; page pulls title/description from nav item
- page-shell — Title/description pattern reused inside `RoomsView`; full-height chat is the Messages exception
- shadcn-ui — Feature components in `components/rooms/` composing existing ui primitives
