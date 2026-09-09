# References for Message Reply

## Similar Implementations

### Message reactions

- **Location:** `components/messages/message-bubble-with-reactions.tsx`, `components/messages/message-reaction-picker.tsx`
- **Relevance:** Existing hover trigger + popover pattern to extend with action sheet and long-press
- **Key patterns:** `MessageReactionSurface`, `QUICK_REACTIONS`, optimistic reaction updates

### Pending attachment previews

- **Location:** `components/messages/message-thread.tsx`, `components/rooms/room-thread.tsx`
- **Relevance:** Composer area above `InputGroup` for job/member share previews — same slot for reply banner
- **Key patterns:** `pendingJobShare` / `pendingMemberShare` state, dismiss on send

### Share preview text

- **Location:** `lib/messages/member-share.ts` (`messageDisplayPreview`)
- **Relevance:** Consistent copy/reply preview for text, job share, and member share messages

### Member share snapshot

- **Location:** `supabase/migrations/20260728200000_message_member_share_snapshot.sql`
- **Relevance:** Denormalized jsonb snapshot pattern for reply quotes when parent message is deleted
