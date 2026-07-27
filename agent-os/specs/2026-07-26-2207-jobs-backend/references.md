# References for Jobs Backend + Wiring

## Similar Implementations

### Jobs UI (existing mock)

- **Location:** `components/jobs/`, `lib/jobs-data.ts`, `app/(app)/jobs/page.tsx`
- **Relevance:** Board pattern, post form fields, role taxonomy, card/row components to wire
- **Key patterns:** Client-side filters, engagement pills, date-only parsing helpers

### Direct Messages backend

- **Location:** `lib/messages/actions.ts`, `supabase/migrations/20260721150000_create_dm_tables.sql`
- **Relevance:** Supabase RLS helper functions, auth checks, migration file structure
- **Key patterns:** `requireUserId()`, security definer helpers, manual migration header

### Rooms backend

- **Location:** `lib/rooms/actions.ts`, `lib/rooms/hooks/`
- **Relevance:** SWR key/fetcher pattern, realtime revalidation after mutations
- **Key patterns:** `swr-keys.ts`, `useSWR` with dedupingInterval, toast on error
