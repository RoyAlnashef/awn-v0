# Message Unsend / Delete — Shaping Notes

## Scope

Add sender-only Unsend (DMs) and Delete (rooms) to the existing message actions popover. Confirmation via AlertDialog, hard delete, optimistic UI with rollback, toast feedback, realtime sync, and inbox/room preview updates when the last message is removed.

## Decisions

- **Who can act:** Sender only (`from === "me"`)
- **Labels:** Unsend in DMs, Delete in rooms
- **Confirmation:** AlertDialog before action (no undo toast)
- **Storage:** Hard delete (existing `reply_to_message_id … on delete set null`)
- **Time limit:** None
- **Surfaces:** DMs and rooms
- **Remote deletes:** Silent removal for other participants (no toast)

## Context

- **Visuals:** None — extends existing popover
- **References:** message-action-sheet, message-reaction-picker, users-table AlertDialog, setMessageReaction auth pattern, use-inbox-realtime
- **Product alignment:** P1 Messages — completes reply spec gap for deleted parent quotes

## Standards Applied

- `css/shadcn-ui` — AlertDialog, Button, Popover primitives
- `css/design-tokens` — destructive action styling via semantic tokens
