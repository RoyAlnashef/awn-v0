# Job Share to DMs and Rooms — Shaping Notes

## Scope

Allow members to share a job listing to an existing DM conversation or joined community room. The Share CTA opens a searchable destination picker (communities first, then active DMs). Selecting a destination navigates to Messages or Rooms with the job pre-attached in the composer; sending posts a rich job card embed.

## Decisions

- **Select behavior:** Navigate to compose — open thread with job pre-attached; user taps Send
- **Message format:** Rich job card embed in the message bubble (optional text note alongside)
- **Surfaces:** `JobCard`, `JobRow`, `JobDetailDrawer`
- **Data model:** Optional `job_id` FK on `dm_messages` and `room_messages`
- **Deferred:** Web Share API, sharing to non-joined rooms, new DM from picker, `/jobs/[id]` page

## Context

- **Visuals:** Job card with Share button + Messages inbox reference in `visuals/`
- **References:** `new-message-drawer.tsx`, `messages-inbox.tsx`, `rooms-inbox.tsx`, `messages-view.tsx`, `attachment.tsx`
- **Product alignment:** P1 Jobs + Messages — members recommend gigs to crew in DMs and discipline rooms

## Standards Applied

- `css/shadcn-ui` — Popover, Input, ScrollArea, Avatar, Attachment primitives
- `css/design-tokens` — semantic tokens, `font-heading` for pay/role emphasis
- `global/board-pattern` — consistent Share wiring on card, row, and detail drawer
