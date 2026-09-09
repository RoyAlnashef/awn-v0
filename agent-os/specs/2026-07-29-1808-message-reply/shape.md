# Message Reply in DMs and Rooms — Shaping Notes

## Scope

Add reply and copy-text actions to DM and room messages. The Plus trigger (replacing Smile) opens a combined popover with quick emoji reactions and a left-aligned action sheet (Reply, Copy Text). Replies persist via `reply_to_message_id` and render as quoted blocks in-thread plus a composer banner while drafting.

## Decisions

- **Desktop trigger:** Hover reveals Plus pill; click opens combined popover
- **Mobile trigger:** Long-press message bubble (~400ms) opens same popover (hover unavailable on touch)
- **Reply scope:** All message types including share-only messages
- **Copy scope:** `messageDisplayPreview` string (body or share fallback)
- **Persistence:** `reply_to_message_id` + `reply_snapshot` jsonb on both message tables
- **Surfaces:** DMs and rooms

## Context

- **Visuals:** Current AWN reaction UI + iMessage/WhatsApp/Instagram reply references in `visuals/`
- **References:** `message-bubble-with-reactions.tsx`, `message-reaction-picker.tsx`, job/member share preview helpers
- **Product alignment:** P1 Messages — threaded replies in DMs and discipline rooms

## Standards Applied

- `css/shadcn-ui` — Popover, Button, Separator primitives
- `css/design-tokens` — semantic tokens for quote blocks and composer banner
