# Rooms Page — Implementation Plan

## Scope

Move community **Rooms** out of the Messages internal nav and header sheet into a first-class sidebar page at `/rooms`. The new page duplicates the Messages split-pane layout (room list + chat thread) using the same chat UI primitives. Unjoined rooms show a **read-only message preview** with a **Join CTA** to participate.

**In scope**

- New `/rooms` route and sidebar entry (main nav, after Messages)
- `RoomsView` mirroring `components/messages/messages-view.tsx`
- Room list + thread with send/receive flows (mock data, local state — same as DMs today)
- Remove Direct/Rooms tabs from `components/messages/messages-inbox.tsx` (Direct-only)
- Header Messages sheet (`components/messages.tsx`) automatically becomes Direct-only via the inbox refactor

**Out of scope (for now)**

- Realtime / API wiring
- Admin Groups page changes (`/groups` stays a separate admin shell)
- Header icon for Rooms (no quick-access sheet requested)

## Shaping decisions

| Decision | Choice |
|----------|--------|
| Sidebar placement | `mainNav`, directly after Messages |
| Unjoined room UX | Read-only transcript preview + Join CTA (no composer until joined) |
| Layout pattern | Match Messages full-height chat shell, not default `PageShell` empty placeholder |
| Data | Extend existing mock data in `lib/messages-data.ts` |

## Tasks

1. Save spec documentation (this folder)
2. Add Rooms to `mainNav` in `lib/nav.ts`; update Messages description
3. Extend `Room` type, add `roomThreads` + `getRoomThread` in `lib/messages-data.ts`
4. Remove Rooms tab from `components/messages/messages-inbox.tsx`
5. Create `components/rooms/` (`rooms-inbox`, `room-thread`, `rooms-view`)
6. Add `app/(app)/rooms/page.tsx` mirroring Messages page shell
7. Smoke-check nav, drawer, join/preview/send flows

## Smoke-check

- Sidebar shows **Rooms** after Messages; navigates to `/rooms`
- `/messages` and header sheet show **Direct only** (no tabs)
- Room list search, select, join/unjoin work
- Joined room: full send flow in thread
- Unjoined room: read-only preview + Join enables composer
- Mobile: back from thread returns to list
- No regressions on existing DM flows
