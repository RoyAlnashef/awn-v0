# Smoke Check — Group @ Mentions and Reply Notifications

- [x] Type `@` in a joined group → member list appears (no all/team rows); popover above composer on desktop and mobile
- [x] Type `@au` → list filters to matching members
- [ ] Select a member → draft shows semi-bold primary name (no `@`); send → bubble shows mention link
- [ ] Press Enter with picker open → first filtered member is selected (Shift+Enter still inserts newline)
- [ ] Edit/delete chars inside a confirmed mention → reverts to `@query` and reopens picker
- [x] Tap mention in sent message → profile drawer opens
- [ ] Sent (primary) bubble mentions use lighter semibold foreground; incoming bubbles keep primary-colored links
- [ ] Mentioned user receives notification; second mention in same group increments count
- [ ] Reply to another member's message → `room_reply` notification; repeat aggregates
- [ ] Open group thread → mention/reply notifications dismissed
- [ ] Mentions tab shows room mention/reply only (not DMs)
- [ ] Mentions tab — tap notification → opens group; stays read; tap again still navigates (never toggles unread)
- [ ] Muted room → no mention/reply notifications
- [ ] DM reply → still only `dm_message` aggregate
