# Room Mute Dropdown — Smoke Check

**Prerequisite:** Run `supabase/migrations/20260825160000_room_mute.sql` in the Supabase SQL Editor before testing.

## Checklist

- [x] **Joined list row:** Shows vertical ellipsis (not "Joined" pill). Unjoined rows still show Join.
- [x] **List ellipsis menu:** Opens Mute (BellOff icon) and Leave (no icon) for non-General rooms.
- [x] **Ellipsis click isolation:** Clicking the ellipsis does not change the active/selected room.
- [x] **Thread header (joined):** No ellipsis or action button — only room info and member avatars.
- [x] **Thread header (unjoined preview):** Join button still appears.
- [x] **Mute:** Select Mute → inbox unread dot/count clears for that room; header rooms nav badge decreases accordingly.
- [x] **Unmute:** Menu label changes to "Unmute" when muted. Selecting it restores unread behavior on new messages.
- [x] **General room:** Dropdown shows Mute/Unmute only — no Leave option.
- [x] **Leave:** From list dropdown on a non-default joined room, Leave works and removes membership.
- [x] **Header sheet:** Rooms popover (nav icon) list behaves the same as main `/rooms` inbox.
- [x] **Errors:** Failed mute/unmute shows a toast error (e.g. before migration is applied).

## Quick manual steps

1. Open `/rooms` and join a non-default room (e.g. Audio, Lighting).
2. Confirm ellipsis appears on the joined row in the left list (not in the thread header).
3. Click ellipsis → Mute. Verify unread styling disappears if the room had unread messages.
4. Open ellipsis again → confirm "Unmute" label → click to restore.
5. Switch to General room → list ellipsis shows Mute only (no Leave).
6. On a joined non-default room, use Leave from the list dropdown and confirm you leave the room.
7. Open the header Rooms sheet — joined rows show ellipsis with the same menu.
