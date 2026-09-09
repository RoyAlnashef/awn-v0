# Smoke Check — Rooms Settings Admin

## Admin button on /rooms

- [ ] Owner/admin sees "Manage Rooms" button left of popout on `/rooms`
- [ ] Regular member does not see "Manage Rooms" button
- [ ] Popout window (`/popout/rooms`) does not show "Manage Rooms" button
- [ ] "Manage Rooms" navigates to `/rooms/settings`

## Settings page

- [ ] `/rooms/settings` shows "Manage Rooms" title and room management table
- [ ] Create room dialog works
- [ ] Edit room dialog works
- [ ] Archive/unarchive works
- [ ] "Back to Rooms" action returns to `/rooms`
- [ ] Non-admin visiting `/rooms/settings` is redirected to `/rooms`

## Navigation cleanup

- [ ] Admin sidebar no longer shows Community
- [ ] `/community` returns 404
- [ ] `/groups` returns 404 (redirect removed)
- [ ] Sidebar **Rooms** item stays active on `/rooms/settings`

## Regression

- [ ] `/rooms` chat UI unchanged for all roles
- [ ] Room list still refreshes after admin creates/archives a room
