# Job Share to DMs and Rooms — Smoke Check

## Prerequisites

- Apply migration `supabase/migrations/20260728180000_message_job_shares.sql` in Supabase SQL Editor
- Signed-in member with at least one joined community room and one DM conversation

## Checklist

1. **Share picker from grid card**
   - Open Jobs board (grid view)
   - Click Share on a job card
   - Picker shows joined communities first, then DM conversations

2. **Search filters destinations**
   - Type a community or person name in the picker search
   - Both sections filter correctly

3. **Share to community**
   - Select a joined community
   - Navigates to `/rooms?room={id}&shareJob={jobId}`
   - Room thread opens with job attachment preview in composer
   - Send works with attachment only, note only, or both
   - Message bubble shows rich job card embed

4. **Share to DM**
   - Share from job card and select a conversation
   - Navigates to `/messages?conversation={id}&shareJob={jobId}`
   - Thread opens with job attachment in composer
   - Send shows job card in bubble; optional note renders below card

5. **Job card tap in thread**
   - Click shared job card in a message
   - Job detail drawer opens

6. **Other surfaces**
   - Share works from list row (`JobRow`)
   - Share works from job detail drawer footer

7. **Inbox preview**
   - Send job-only share (no text)
   - DM inbox and room list show preview like `Shared a job · {role}`

8. **Remove attachment**
   - Before sending, remove job preview from composer
   - Send button disables when both attachment and text are empty
