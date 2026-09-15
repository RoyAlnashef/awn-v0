# References for Accept Application with DM

## Similar Implementations

### Job application review drawer

- **Location:** `components/jobs/job-application-review-drawer.tsx`
- **Relevance:** Existing Accept/Maybe/Decline footer; target for compose mode
- **Key patterns:** Flyout drawer, status-gated footer

### Membership deny dialog

- **Location:** `components/applications/deny-dialog.tsx`
- **Relevance:** Note textarea + submit with validation
- **Key patterns:** Textarea, pending state, toast on success

### DM server actions

- **Location:** `lib/messages/actions.ts`
- **Relevance:** `getOrCreateConversation`, `sendMessage` with `jobId`
- **Key patterns:** Two-step conversation + message insert

### Notification creation

- **Location:** `lib/applications/actions.ts`, `lib/notifications/actions.ts`
- **Relevance:** `createNotification` via admin client
- **Key patterns:** kind, title, body, data payload

### Notifications UI

- **Location:** `components/notifications.tsx`
- **Relevance:** DM click → `/messages?conversation=`
- **Key patterns:** Tab filtering, mark read on navigate
