# Member Share to Messages — Smoke Check

## Prerequisites

- Apply migration `supabase/migrations/20260728190000_message_member_shares.sql` in Supabase SQL Editor
- Apply migration `supabase/migrations/20260728200000_message_member_share_snapshot.sql` in Supabase SQL Editor
- Job share migration (`20260728180000_message_job_shares.sql`) already applied
- Signed-in member with at least one DM conversation
- People mock `Person.id` values aligned to real profile UUIDs in dev Supabase (Task 10)

## Checklist

1. **Share picker from grid card**
   - Open People board (grid view)
   - Click Share on a person card
   - Picker shows **Messages section only** (no communities)

2. **Search filters destinations**
   - Type a contact name or role in the picker search
   - DM conversations filter correctly

3. **Share to DM**
   - Select a conversation
   - Navigates to `/messages?conversation={id}&shareMember={profileId}`
   - Thread opens with member attachment preview in composer
   - Send works with attachment only, note only, or both
   - Message bubble shows rich member card embed

4. **Member card tap in thread**
   - Click shared member card in a message
   - Person profile drawer opens

5. **Other surfaces**
   - Share works from list row (`PersonRow`)
   - Share works from profile drawer footer Share button

6. **Inbox preview**
   - Send member-only share (no text)
   - DM inbox shows preview like `Shared a member · {name}`

7. **No rooms integration**
   - Confirm share does **not** appear as an option in any rooms flow
   - No `/rooms?shareMember=...` routing exists

8. **Mutual exclusivity**
   - Composer with both `shareJob` and `shareMember` URL params resolves to one attachment (documented precedence)
   - Server rejects send with both `jobId` and `sharedProfileId`

9. **Remove attachment**
   - Before sending, remove member preview from composer
   - Send button disables when both attachment and text are empty
