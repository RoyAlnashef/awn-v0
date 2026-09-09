---

name: Message Unsend / Delete
overview: Add sender-only Unsend (DMs) and Delete (rooms) to the existing message actions popover, with confirmation dialog, hard delete, optimistic UI, toast feedback, realtime sync, and inbox preview updates.
todos:

- id: save-spec
  content: "Task 1: Save spec folder (plan, shape, standards, references, smoke-check)"
  status: completed
- id: db-migration
  content: "Task 2: Add delete RLS policies for dm_messages and room_messages"
  status: pending
- id: server-actions
  content: "Task 3: Implement deleteMessage / deleteRoomMessage + applyMessageDelete helper"
  status: pending
- id: popover-ui
  content: "Task 4: Extend MessageActionSheet and MessageActionsPopover; add MessageDeleteDialog"
  status: pending
- id: thread-wiring
  content: "Task 5: Wire delete flow in message-thread.tsx and room-thread.tsx"
  status: pending
- id: realtime
  content: "Task 6: Handle DELETE postgres_changes in inbox and rooms realtime hooks"
  status: pending
- id: inbox-preview
  content: "Task 7: Update DM inbox and room list previews when last message deleted"
  status: pending
- id: smoke-check
  content: "Task 8: Manual smoke verification"
  status: pending
isProject: false

---

# Message Unsend / Delete — MVP Spec

## Shaping Summary

| Decision | Choice |
| -------- | ------ |
| Surfaces | DMs (`message-thread.tsx`) + rooms (`room-thread.tsx`) |
| Who can act | **Sender only** (`from === "me"`) |
| Labels | **Unsend** in DMs, **Delete** in rooms (same behavior) |
| Confirmation | **AlertDialog** before action |
| Storage | **Hard delete** row |
| Time limit | **None** |
| Undo toast | Out of scope |
| Admin moderation | Out of scope |
| Visuals | None — extends existing popover layout |
| Standards | `css/shadcn-ui`, `css/design-tokens` |

**Product alignment:** Extends P1 Messages. Builds on message reply spec and completes deleted-parent quote unavailable behavior.

See full task breakdown in the attached implementation plan. Key files: migration RLS, `lib/messages/delete.ts`, `message-delete-dialog.tsx`, thread wiring, realtime DELETE handlers.
