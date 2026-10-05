# Smoke check — DM inbox thread actions

## Inbox (desktop `/messages` + header sheet)

- [ ] Row shows ellipsis menu; Mute toggles BellOff icon and suppresses unread badge
- [ ] Mark as unread on read thread shows unread styling without opening thread
- [ ] Archive removes from main list; Archived section lists it; Unarchive restores
- [ ] New message in archived thread returns it to main inbox
- [ ] Delete for me confirms, removes thread; reopen via New message shows fresh history only
- [ ] Muted thread: no push (when migration applied)

## Thread

- [ ] Own message: Unsend still removes for everyone
- [ ] Received message: Delete for me hides bubble locally only

## Regression

- [ ] Realtime inbox updates still work
- [ ] Sidebar/header DM unread count excludes muted/archived/hidden
