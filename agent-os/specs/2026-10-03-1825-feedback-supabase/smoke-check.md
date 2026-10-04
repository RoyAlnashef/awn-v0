# Smoke check — Member feedback → Supabase

## Prerequisite

- [ ] Run [`supabase/migrations/20261003183000_feedback.sql`](../../../supabase/migrations/20261003183000_feedback.sql) in the Supabase SQL Editor

## Member submit

- [ ] Sign in as a member
- [ ] Open the feedback widget, choose a type, fill summary/details, attach 1–2 screenshots
- [ ] Submit → confirmation shows `FB-xxxx`
- [ ] Refresh the app → submission still exists in admin (not lost on server restart)

## Admin triage

- [ ] Sign in as admin, open `/feedback`
- [ ] New tab shows the submission; search and type filters work
- [ ] Open detail sheet → screenshots render; context block shows URL/platform
- [ ] Change status and save internal note → persists after refresh
- [ ] Reply-by-email link uses submitter email when “OK to contact” was checked
