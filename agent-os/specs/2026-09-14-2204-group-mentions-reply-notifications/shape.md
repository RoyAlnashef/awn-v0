# Group @ Mentions and Reply Notifications — Shaping Notes

## Scope

Add @-mention composer UX and rendering for group (room) threads, plus aggregated group mention and reply notifications. DM replies continue using existing `dm_message` aggregation.

## Decisions

- Mentions are **group-only** — no @ picker in DMs
- Picker shows **room members only** (no "all" or "team" rows)
- After selection: drop `@`, show display name as **primary link without underline**
- Desktop: popover anchored above composer; mobile: bottom sheet
- Mention link tap opens member profile drawer
- Group notifications aggregate per `(user_id, room_id, kind)` for `room_mention` and `room_reply`
- Pause notification increments while viewing room (`viewing_room_id`)
- Skip notifications for muted rooms
- DM reply notifications: reuse existing DM message aggregation

## Context

- **Visuals:** WhatsApp mention flow (trigger/filter/compose/sent) + Facebook name-only link style
- **References:** DM notification migration, message-reply spec, invite popover/sheet pattern, room members preview
- **Product alignment:** Private group messaging for touring crew ([mission.md](../../product/mission.md))

## Standards Applied

- css/shadcn-ui — compose from `@/components/ui/*`
- css/design-tokens — primary link color via semantic tokens
