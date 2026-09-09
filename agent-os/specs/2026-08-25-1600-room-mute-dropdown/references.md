# References for Room Mute Dropdown

## Similar Implementations

### Room thread header (Leave button)

- **Location:** `components/rooms/room-thread.tsx` L655–663
- **Relevance:** Current Leave pill button replaced by ellipsis dropdown
- **Key patterns:** `pendingAction` state, `handleLeave`, conditional on `!room.isDefault`

### Users table actions dropdown

- **Location:** `components/users/users-table.tsx` L517–530
- **Relevance:** Ghost icon trigger + `DropdownMenuContent align="end"`
- **Key patterns:** `DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}`

### Room join/leave server actions

- **Location:** `lib/rooms/actions.ts`
- **Relevance:** `joinRoom` / `leaveRoom` pattern for `muteRoom` / `unmuteRoom`
- **Key patterns:** `requireUserId()`, UUID validation, `{ ok: true } | ActionError`

### Rooms provider

- **Location:** `components/rooms/rooms-provider.tsx`
- **Relevance:** `toggleJoin`, SWR revalidation via `roomsListKey` + `roomsUnreadCountKey`

### Latest list_rooms_for_user RPC

- **Location:** `supabase/migrations/20260730150000_room_message_member_shares.sql`
- **Relevance:** Base for adding `muted` field and unread suppression
