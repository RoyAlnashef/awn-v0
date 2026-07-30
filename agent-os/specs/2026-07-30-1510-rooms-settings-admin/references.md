# References for Rooms Settings Admin

## Similar Implementations

### Former Community admin page

- **Location:** `app/(app)/community/page.tsx` (removed)
- **Relevance:** Server fetch + `PageShell` + `RoomsTable` pattern moved to `/rooms/settings`
- **Key patterns:** `adminListRooms()` on load; error state passed to table

### Rooms page header

- **Location:** `components/rooms/rooms-view.tsx`
- **Relevance:** Custom header with popout button; now includes admin "Manage Rooms" action
- **Key patterns:** Title/description left; action group right in `flex shrink-0 items-center gap-2`

### Messages header action group

- **Location:** `components/messages/messages-view.tsx`
- **Relevance:** Reference for grouping popout + secondary action buttons in header
- **Key patterns:** `PopOutButton` + `Button` in shared flex container

### Admin role checks

- **Location:** `lib/auth/get-session-user.ts`, `lib/auth/require-admin.ts`
- **Relevance:** `canAccessAdmin` for UI gating; `requireAdmin()` in server actions
- **Key patterns:** Server component passes boolean prop to client view; mutations guarded server-side

### Rooms admin table

- **Location:** `components/groups/rooms-table.tsx`
- **Relevance:** Reused unchanged on settings page
- **Key patterns:** Create/edit/archive dialogs; optimistic local state updates
