# Smoke Check — Group @ Mentions and Reply Notifications

- [x] Type `@` in a joined group → member list appears (no all/team rows); popover above composer on desktop and mobile
- [x] Type `@au` → list filters to matching members
- [x] Select a member → draft shows semi-bold primary name (no `@`); send → bubble shows mention link
- [x] Press Enter with picker open → first filtered member is selected (Shift+Enter still inserts newline)
- [x] Edit/delete chars inside a confirmed mention → reverts to `@query` and reopens picker
- [x] Tap mention in sent message → profile drawer opens
- [x] Sent (primary) bubble mentions use lighter semibold foreground; incoming bubbles keep primary-colored links
- [x] Mentioned user receives notification; second mention in same group increments count
- [x] Reply to another member's message → `room_reply` notification; repeat aggregates
- [x] Open group thread → mention/reply notifications dismissed
- [x] Mentions tab shows room mention/reply only (not DMs)
- [x] Mentions tab — tap notification → opens group; stays read; tap again still navigates (never toggles unread)
- [x] Muted room → no mention/reply notifications
- [x] DM reply → still only `dm_message` aggregate
