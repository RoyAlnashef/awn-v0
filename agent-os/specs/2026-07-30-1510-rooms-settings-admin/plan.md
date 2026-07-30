# Move Room Management to /rooms/settings

## Scope

Consolidate admin room management into the Rooms area of the app:

- **Remove** the Admin → Community page at `app/(app)/community/page.tsx` and its sidebar entry in `lib/nav.ts`
- **Add** a new sub-page at `/rooms/settings` with the existing `RoomsTable` admin UI
- **Add** a "Manage Rooms" button in the Rooms page header, immediately left of the popout icon, visible only to owners/admins
- **No redirect** from `/community` — old URL returns 404

**In scope:** routing, nav cleanup, header button, settings page shell, spec docs

**Out of scope:** changes to `RoomsTable`, create/edit/archive dialogs, or server actions (already guarded by `requireAdmin()`)

## Shaping decisions

| Decision | Choice |
|----------|--------|
| Sub-page route | `/rooms/settings` |
| Old `/community` URL | Remove page; 404 (no redirect) |
| Button label | "Manage Rooms" |
| Button visibility | Owners and admins only (`canAccessAdmin`) |
| Button placement | Left of popout button in `RoomsView` header |
| Settings page layout | `PageShell` + `RoomsTable` |
| Settings page title | "Manage Rooms" with description from former Community nav item |
| Non-admin access to `/rooms/settings` | Redirect to `/rooms` |

## Tasks

1. Save spec documentation (this folder)
2. Remove Community admin page and nav entry
3. Create `/rooms/settings` page
4. Add admin-only "Manage Rooms" button to Rooms header
5. Smoke-check
