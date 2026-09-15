# References for Group @ Mentions and Reply Notifications

## Similar Implementations

### DM message notification aggregation

- **Location:** `supabase/migrations/20260912180000_dm_message_notifications.sql`
- **Relevance:** Write-time upsert pattern, viewing pause, dismiss RPC
- **Key patterns:** Partial unique index, trigger on message insert, `updated_at` for sort

### Message reply feature

- **Location:** `agent-os/specs/2026-07-29-1808-message-reply/`
- **Relevance:** Reply persistence and UI in room threads
- **Key patterns:** `reply_to_message_id`, `reply_snapshot`, `MessageReplyComposer`

### Invite popover / mobile dialog split

- **Location:** `components/invites/invite-popover.tsx`
- **Relevance:** Desktop popover vs mobile sheet pattern
- **Key patterns:** `useIsMobile()` branch

### Room members preview

- **Location:** `lib/rooms/actions.ts` (`getRoomMembersPreview`), `lib/rooms/hooks/use-room-members-preview.ts`
- **Relevance:** Member list source for @ picker
