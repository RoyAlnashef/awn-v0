# Rooms Settings Admin — Shaping Notes

## Scope

Move admin room management from the standalone Admin → Community page into a `/rooms/settings` sub-page. Add an admin-only "Manage Rooms" button on the main Rooms page header (left of popout). Remove the Community admin nav entry and page.

## Decisions

- **Sub-page route:** `/rooms/settings`
- **Old `/community` URL:** Remove page; 404 (no redirect)
- **Button label:** "Manage Rooms"
- **Button visibility:** Owners and admins only (`canAccessAdmin`)
- **Button placement:** Left of popout button in `RoomsView` header
- **Settings page layout:** `PageShell` + `RoomsTable` (same content as former Community page)
- **Settings page title:** "Manage Rooms" with description from former Community nav item
- **Non-admin access to `/rooms/settings`:** Redirect to `/rooms`

## Context

- **Visuals:** Three screenshots in `visuals/` — former Community admin table, Rooms page header, header action area close-up
- **References:** `app/(app)/community/page.tsx`, `components/rooms/rooms-view.tsx`, `components/messages/messages-view.tsx`, `components/groups/rooms-table.tsx`
- **Product alignment:** Rooms are discipline-specific community channels; admins should manage them in context rather than a separate admin section

## Standards Applied

- sidebar-nav — remove Community from `adminNav`; settings is a deep-link under Rooms
- page-shell — settings page uses `PageShell` with title, description, and back action
