# Smoke Check — Message Unsend / Delete

- [ ] Unsend appears only on own messages (DM); Delete only on own (room)
- [ ] Other users' messages show Reply + Copy only
- [ ] Confirmation dialog appears; Cancel keeps message
- [ ] Confirm removes message optimistically; persists after refresh
- [ ] Success toast: "Message unsent" (DM) / "Message deleted" (room)
- [ ] Error toast on failure; message restored in thread
- [ ] Deleting message clears active reply composer if replying to it
- [ ] Replies to deleted message show "Message unavailable"
- [ ] Reactions on deleted message disappear
- [ ] Other participant sees message vanish silently (realtime)
- [ ] Inbox preview updates when last message deleted (DM)
- [ ] Room list preview updates when last message deleted
- [ ] Unsend not shown for in-flight optimistic sends (no server ID)
- [ ] Long-press + desktop Plus popover both expose action
- [ ] Job share, member share, and text-only messages all deletable
