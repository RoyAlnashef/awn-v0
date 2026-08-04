# Account Jobs — Smoke Check

Run after applying migration `20260803210000_add_job_draft_status.sql` in Supabase SQL Editor.

## Checklist

- [ ] Created tab lists jobs posted by signed-in user (all non-deleted statuses)
- [ ] Saved tab lists bookmarked jobs with saved date
- [ ] Post a job opens dialog; Post role creates open listing visible on `/jobs` board
- [ ] Save draft creates draft visible on Created tab but NOT on public board
- [ ] Edit opens prefilled dialog; saving publishes draft or updates fields
- [ ] Unsave removes job from Saved tab
- [ ] Tab counts update after create/save/unsave
- [ ] Status badges show raw DB values with correct colors

## Notes

- Migration must be applied manually before draft status works in production/staging DB.
- TypeScript compiles for all changed files (`jobs-section`, `post-job-dialog`, `/api/jobs/mine`, `lib/jobs/*`).
- Public jobs board continues to filter `status = 'open'` — drafts remain poster-only via RLS.
