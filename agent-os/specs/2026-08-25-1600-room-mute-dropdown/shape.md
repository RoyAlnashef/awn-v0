# Room Mute Dropdown — Shaping Notes

## Scope

Replace the room thread header Leave button with an `EllipsisVertical` icon button that opens a shadcn DropdownMenu. Menu items:

- **Mute / Unmute** — always shown for joined rooms; `BellOff` icon; label toggles based on state
- **Leave** — icon-less; hidden for default/General rooms (`room.isDefault`)

## Decisions

- **Mute semantics:** Suppress per-room unread badges and global rooms nav unread count. Persist on `room_memberships.muted_at`.
- **Push notifications:** Add `is_room_muted_for_user()` SQL helper for future web push filtering; no push sender in this work.
- **Unmute toggle:** WhatsApp-style — menu shows "Unmute" when muted, "Mute" when not.
- **General room:** Mute only; cannot Leave (unchanged rule).
- **Unjoined rooms:** Join button only; no actions dropdown.

## Context

- **Visuals:** `visuals/current-leave-button.png`, `visuals/ellipsis-vertical-icon.png`, `visuals/whatsapp-mute-reference.png`
- **References:** `room-thread.tsx`, `users-table.tsx`, `lib/rooms/actions.ts`, `rooms-provider.tsx`
- **Product alignment:** Discipline rooms are core messaging in AWN (`agent-os/product/mission.md`); mute gives members control over notification noise without leaving the room.

## Standards Applied

- `css/shadcn-ui` — DropdownMenu + Button from `@/components/ui/*`
- `css/design-tokens` — semantic tokens, no hard-coded colors
