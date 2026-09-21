# References for Private Groups

## Similar Implementations

### Manage groups table

- **Location:** `components/groups/rooms-table.tsx`
- **Relevance:** Members column click target for Group Members drawer
- **Key patterns:** Admin table layout, edit/archive actions, member count display

### Create/edit group dialogs

- **Location:** `components/groups/create-room-dialog.tsx`, `components/groups/edit-room-dialog.tsx`
- **Relevance:** Toggle + textarea pattern for private setting and note
- **Key patterns:** Switch for auto-join, form validation, adminCreateRoom/adminUpdateRoom

### Nested drawer stack

- **Location:** `components/ui/drawer.tsx`
- **Relevance:** Base UI automatic stack for profile drawer inside members drawer
- **Key patterns:** `FLYOUT_DRAWER_CONTENT_CLASS`, `swipeDirection="right"`

### Person profile drawer

- **Location:** `components/people/person-profile-drawer.tsx`
- **Relevance:** Nested member detail from members list
- **Key patterns:** Lazy fetch via getMemberById, requestAnimationFrame first-mount

### Application review panel

- **Location:** `components/applications/application-review-panel.tsx`
- **Relevance:** Approve/deny actions for pending requests
- **Key patterns:** Flyout drawer layout, action buttons in footer

### Notifications

- **Location:** `lib/notifications/actions.ts`, `components/notifications.tsx`
- **Relevance:** Admin notify on join request, deep link routing
- **Key patterns:** createNotification with roomId in data payload

### Room join (current)

- **Location:** `lib/rooms/actions.ts` — `joinRoom`
- **Relevance:** Public instant join path unchanged; private delegates to request flow
- **Key patterns:** room_memberships insert, SWR revalidation

### Prior rooms admin spec

- **Location:** `agent-os/specs/2026-07-30-1510-rooms-settings-admin/plan.md`
- **Relevance:** Settings page at `/groups/settings` with PageShell + RoomsTable
