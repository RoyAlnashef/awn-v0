# Job Share to DMs and Rooms — Smoke Check

## Prerequisites

- Apply migration `supabase/migrations/20260728180000_message_job_shares.sql` in Supabase SQL Editor
- Signed-in member with at least one joined community room

## Checklist

1. **Share job to message from grid card**
   - Open Jobs board (grid view)
   - Click Share2 (message share) on a job card
   - "Share with…" flyout opens **over the jobs page** (no navigation yet)
   - Search for a recipient and select them
   - Navigates to `/messages?conversation={id}&shareJob={jobId}`
   - Thread opens with job attachment preview in composer

2. **Share job to community from grid card**
   - Click Hash (community share) on a job card
   - Popover shows joined communities only
   - Search filters communities correctly

3. **Share to community**
   - Select a joined community
   - Navigates to `/rooms?room={id}&shareJob={jobId}`
   - Room thread opens with job attachment preview in composer
   - Send works with attachment only, note only, or both
   - Message bubble shows rich job card embed

4. **Share to new DM**
   - Share via Share2 and pick someone you have **no** existing thread with
   - New conversation opens with job attachment in composer
   - Send shows job card in bubble

5. **Share to existing DM via drawer**
   - Share via Share2 and search for someone you already message
   - Existing conversation opens (no duplicate thread) with job attachment

6. **Inbox conversation while share pending**
   - Land on Messages with `shareJob` param and drawer open
   - Click an existing conversation in the inbox instead
   - Job attachment remains in composer

7. **Job card tap in thread**
   - Click shared job card in a message
   - Job detail drawer opens

8. **Other surfaces**
   - Message share (Share2) and community share (Hash) work from list row (`JobRow`)
   - Share works from job detail drawer footer

9. **Inbox preview**
   - Send job-only share (no text)
   - DM inbox and room list show preview like `Shared a job · {role}`

10. **Remove attachment**
    - Before sending, remove job preview from composer
    - Send button disables when both attachment and text are empty

11. **Close flyout without sharing**
    - Click Share2 on a job card, then close the flyout
    - User remains on the jobs page

12. **Popout**
    - Share-to-message thread flow works after recipient selection from jobs/people pages
