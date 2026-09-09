# Member Share to Messages — Smoke Check

## Prerequisites

- Apply migration `supabase/migrations/20260728190000_message_member_shares.sql` in Supabase SQL Editor
- Apply migration `supabase/migrations/20260728200000_message_member_share_snapshot.sql` in Supabase SQL Editor
- Apply migration `supabase/migrations/20260730150000_room_message_member_shares.sql` in Supabase SQL Editor
- Job share migration (`20260728180000_message_job_shares.sql`) already applied
- People mock `Person.id` values aligned to real profile UUIDs in dev Supabase (Task 10)

## Checklist — Direct messages

1. **Share member from grid card**
   - Open People board (grid view)
   - Click Share on a person card
   - "Share with…" flyout opens **over the people page** (no navigation yet)
   - Search for a recipient and select them
   - Navigates to `/messages?conversation={id}&shareMember={profileId}`
   - Thread opens with member attachment preview in composer

2. **Search and select recipient**
   - Search for a recipient in the drawer
   - Select them — thread opens with member attachment preview in composer

3. **Share to new DM**
   - Pick someone you have **no** existing thread with
   - New conversation opens with member attachment
   - Send works with attachment only, note only, or both

4. **Share to existing DM via drawer**
   - Search for someone you already message
   - Existing conversation opens (no duplicate) with member attachment

5. **Inbox conversation while share pending**
   - Land on Messages with `shareMember` param and drawer open
   - Click an existing conversation in the inbox instead
   - Member attachment remains in composer

6. **Member card tap in thread**
   - Click shared member card in a message
   - Person profile drawer opens

7. **Other surfaces**
   - Share works from list row (`PersonRow`)
   - Share works from profile drawer footer Share button

8. **Inbox preview**
   - Send member-only share (no text)
   - DM inbox shows preview like `Shared a member · {name}`

9. **Mutual exclusivity**
   - Composer with both `shareJob` and `shareMember` URL params resolves to one attachment (member takes precedence)
   - Server rejects send with both `jobId` and `sharedProfileId`

10. **Remove attachment**
    - Before sending, remove member preview from composer
    - Send button disables when both attachment and text are empty

11. **Close flyout without sharing**
    - Click Share on a person card, then close the flyout
    - User remains on the people page

## Checklist — Community rooms

12. **Share to room from grid card**
    - Click Hash (#) on a person card
    - Room popover shows joined rooms (search when >5 rooms)
    - Select a room → `/rooms?room={id}&shareMember={profileId}`
    - Room thread opens with member attachment preview in composer

13. **Share to room from other surfaces**
    - Hash button works from list row (`PersonRow`)
    - Hash button works from profile drawer footer

14. **Send in room thread**
    - Send with attachment only, note only, or both
    - Received bubble shows rich member card; tap opens profile drawer

15. **Room inbox preview**
    - Send member-only share in a room (no text)
    - Rooms list shows preview like `Shared a member · {name}`

16. **Room mutual exclusivity**
    - Cannot attach job and member in same room message (server rejects)

17. **DM share unchanged**
    - Share icon still opens DM flyout; Hash icon opens room popover
