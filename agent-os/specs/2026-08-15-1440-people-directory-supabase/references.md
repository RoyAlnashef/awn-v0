# References for People Directory — Supabase Wiring

## Similar Implementations

### Account Profile Supabase

- **Location:** `agent-os/specs/2026-08-03-1827-account-profile-supabase/`
- **Relevance:** `toPersonFromProfile()`, `MEMBER_PROFILE_SELECT`, profile server actions
- **Key patterns:** Extend profiles table, map DB → Person type

### Users Page RSC

- **Location:** `app/(app)/users/page.tsx`, `lib/users/actions.ts`
- **Relevance:** Server component calls server action, passes data to client table
- **Key patterns:** `listUsers()` in RSC, error handling via `loadError` prop

### Member Share to Messages

- **Location:** `agent-os/specs/2026-07-28-1740-member-share-to-messages/`
- **Relevance:** PersonShareCard, fetchMemberSharePayload, profile FK on messages
- **Key patterns:** Expand share payload fields from profiles join

### Messages Search

- **Location:** `lib/messages/actions.ts` — `searchMessageableUsers()`
- **Relevance:** Query active profiles for authenticated members
- **Key patterns:** Exclude self, filter by status, ilike search
