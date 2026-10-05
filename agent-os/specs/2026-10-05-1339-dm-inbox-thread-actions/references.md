# References for DM Inbox and Thread Actions

## Similar Implementations

### Room actions dropdown

- **Location:** `components/rooms/room-actions-dropdown.tsx`
- **Relevance:** Template for `ConversationActionsDropdown` (ellipsis, Mute BellOff, separator, destructive-adjacent Leave)
- **Key patterns:** `stopPropagation`, pending action state, toast on error

### Rooms inbox row

- **Location:** `components/rooms/rooms-inbox.tsx`
- **Relevance:** Trailing `BellOff` + dropdown on joined rows

### Room mute migration

- **Location:** `supabase/migrations/20260825160000_room_mute.sql`, `lib/rooms/actions.ts`
- **Relevance:** `muted_at` column, RPC unread suppression, `muteRoom` / `unmuteRoom`

### DM inbox and actions

- **Location:** `components/messages/messages-inbox.tsx`, `lib/messages/actions.ts`
- **Relevance:** `list_dm_inbox` RPC, `inboxRowToConversation`, `markConversationRead`

### Message unsend

- **Location:** `agent-os/specs/2026-07-29-1920-message-unsend/`, `message-delete-dialog.tsx`
- **Relevance:** Hard delete for Unsend; extend dialog with `hide` variant

### Latest list_dm_inbox

- **Location:** `supabase/migrations/20261001190000_member_reports_and_blocks.sql`
- **Relevance:** Base RPC including `messaging_blocked`

### get_dm_thread

- **Location:** `supabase/migrations/20260915180000_fix_thread_pagination_trim.sql`
- **Relevance:** Full thread JSON; add cleared_at + hide filters
