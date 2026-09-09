# References for Rooms Backend

## Primary Reference: DM Layer

The DM implementation is the direct template for all rooms backend work.

### lib/messages/actions.ts
- **Relevance:** Template for `lib/rooms/actions.ts`
- **Key patterns:** `requireUserId()`, `actionError()`, RPC calls, result union types

### lib/messages/hooks/
- **Relevance:** Template for `lib/rooms/hooks/`
- **Key patterns:** `use-inbox.ts` → `use-rooms-list.ts`; `use-thread.ts` → `use-room-thread.ts`; `use-inbox-realtime.ts` → `use-rooms-realtime.ts`; `use-unread-count.ts` → `use-rooms-unread-count.ts`

### supabase/migrations/20260721150000_create_dm_tables.sql
- **Relevance:** Schema template for room tables
- **Key patterns:** Table structure, RLS policies, RPC functions, realtime publication

### supabase/migrations/20260722160000_dm_message_reactions.sql
- **Relevance:** Schema template for `room_message_reactions`
- **Key patterns:** Reactions table, RLS on reactions, `get_dm_thread` RPC with reactions

## UI References

### components/rooms/ (all existing files)
- **Relevance:** Existing mock UI to be wired — do not restructure, only update data sources

### components/app-sidebar.tsx
- **Relevance:** Shows how `liveBadge: "messages"` pattern works; extend for rooms

### lib/nav.ts
- **Relevance:** Rooms nav item has static `badge: "2"` — extend `liveBadge` to support `"rooms"`
