# References for Job Share to DMs and Rooms

## Similar Implementations

### New Message Drawer

- **Location:** `components/messages/new-message-drawer.tsx`
- **Relevance:** Searchable people picker with debounced server search
- **Key patterns:** Search Input with icon, ScrollArea list, avatar rows, select handler closes drawer

### Messages Inbox

- **Location:** `components/messages/messages-inbox.tsx`
- **Relevance:** DM conversation list with client-side search filter
- **Key patterns:** `useMemo` filter, avatar + name rows, relative timestamps

### Rooms Inbox

- **Location:** `components/rooms/rooms-inbox.tsx`
- **Relevance:** Joined room list with client-side search
- **Key patterns:** Room icon + name rows, section header with count

### Messages View (URL deep-linking)

- **Location:** `components/messages/messages-view.tsx`, `app/(app)/messages/page.tsx`
- **Relevance:** `conversation`, `person`, `draft` URL params — extend with `shareJob`
- **Key patterns:** Param sync/clear after consume, pass to `MessageThread`

### Job Card / Detail Drawer

- **Location:** `components/jobs/job-card.tsx`, `components/jobs/job-detail-drawer.tsx`
- **Relevance:** Unwired Share buttons; pointer-events layering for card click vs actions
- **Key patterns:** `pointer-events-auto relative z-10` on action buttons

### Attachment UI

- **Location:** `components/ui/attachment.tsx`
- **Relevance:** Composer preview for pending job share before send

### Send Message Actions

- **Location:** `lib/messages/actions.ts`, `lib/rooms/actions.ts`
- **Relevance:** Extend `sendMessage` / `sendRoomMessage` with optional `jobId`
