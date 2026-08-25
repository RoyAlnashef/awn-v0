# Room Mute Dropdown

See attached plan for full implementation details. This spec folder captures shaping work for the room mute dropdown feature.

## Scope

Replace the room thread header Leave button with an ellipsis-vertical dropdown offering Mute/Unmute (BellOff icon) and Leave (icon-less, hidden for default/General rooms). Persist mute on `room_memberships`, suppress unread badges and nav counts, add DB helper for future push.

## Tasks

1. Save spec documentation
2. Database migration — `muted_at` column + RPC updates
3. Server actions — `muteRoom` / `unmuteRoom`
4. Provider + SWR wiring — `toggleMute`
5. Room thread header UI — DropdownMenu
6. Smoke check

## Out of scope

- Web push sender implementation
- Mute duration picker
- Muted-room icon in inbox sidebar
