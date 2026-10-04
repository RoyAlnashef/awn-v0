# References for Member Feedback → Supabase

## Similar Implementations

### Admin list + profile join

- **Location:** [`lib/moderation/actions.ts`](../../../lib/moderation/actions.ts) — `listMemberReports`
- **Relevance:** `requireAdmin` in actions; data fetch with `createClient` and nested `profiles` select
- **Key patterns:** Map DB rows to UI types; order by `created_at desc`

### Private Storage upload (service role)

- **Location:** [`lib/applications/actions.ts`](../../../lib/applications/actions.ts) — `uploadResume`
- **Relevance:** `createAdminClient`, buffer upload, path convention, no public bucket URL for private files

### Migration + RLS style

- **Location:** [`supabase/migrations/20261001190000_member_reports_and_blocks.sql`](../../../supabase/migrations/20261001190000_member_reports_and_blocks.sql)
- **Relevance:** Header comment, `is_admin()` policies, manual SQL Editor note

### Error logs (service-role insert only)

- **Location:** [`supabase/migrations/20260916180000_error_logs.sql`](../../../supabase/migrations/20260916180000_error_logs.sql)
- **Relevance:** Admin-only select; inserts via service role without member insert policy on child tables

### In-memory store (being replaced)

- **Location:** [`lib/feedback/store.ts`](../../../lib/feedback/store.ts)
- **Relevance:** Exported functions `listFeedbackRecords`, `insertFeedbackRecord`, `updateFeedbackRecord` must keep signatures for actions/UI
