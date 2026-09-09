# References for Message Unsend / Delete

## Similar Implementations

### Message actions popover

- **Location:** `components/messages/message-reaction-picker.tsx`, `components/messages/message-action-sheet.tsx`
- **Relevance:** Extend action sheet with third destructive row; popover closes before dialog opens
- **Key patterns:** `MessageActionsPopover`, `hasActions`, `closePopover()` on select

### Thread copy/reply handlers

- **Location:** `components/messages/message-thread.tsx`, `components/rooms/room-thread.tsx`
- **Relevance:** Same handler wiring pattern for `onDelete`; toast feedback via sonner
- **Key patterns:** `handleCopyMessage`, `handleReplyToMessage`, `pendingReply` state

### Destructive confirmation dialog

- **Location:** `components/users/users-table.tsx`
- **Relevance:** AlertDialog with destructive confirm button and pending state
- **Key patterns:** Controlled `confirm` state, `AlertDialogAction variant="destructive"`

### Server action auth

- **Location:** `lib/messages/actions.ts` (`setMessageReaction`)
- **Relevance:** Fetch message, verify participant/membership, mutate row
- **Key patterns:** `requireUserId`, `{ ok: true } | { ok: false, error }` result type

### Realtime inbox

- **Location:** `lib/messages/hooks/use-inbox-realtime.ts`, `lib/rooms/hooks/use-rooms-realtime.ts`
- **Relevance:** Add DELETE listeners alongside existing INSERT handlers
- **Key patterns:** `postgres_changes`, SWR `mutate` for thread cache patches

### Reply FK on delete

- **Location:** `supabase/migrations/20260729180000_message_replies.sql`
- **Relevance:** `reply_to_message_id … on delete set null`; UI shows "Message unavailable" via `MessageReplyQuote`
