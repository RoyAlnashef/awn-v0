# References for Member Share to Messages

## Primary Reference — Job Share Implementation

The member share feature mirrors the job share flow with DMs-only destinations. Start here:

| Area | Location | Notes |
| ---- | -------- | ----- |
| Spec | `agent-os/specs/2026-07-28-1640-job-share-to-messages/` | Full plan, smoke check, visuals |
| Share picker | `components/jobs/job-share-popover.tsx` | Adapt: remove Communities section, change URL param to `shareMember` |
| Share card | `components/jobs/job-share-card.tsx` | Adapt: member fields (avatar, name, role, location, availability, stats) |
| Share helpers | `lib/messages/job-share.ts` | Mirror for `lib/messages/member-share.ts` |
| Migration | `supabase/migrations/20260728180000_message_job_shares.sql` | Pattern for `shared_profile_id` column, preview helper, `get_dm_thread` join |
| Job surfaces | `components/jobs/job-card.tsx`, `job-row.tsx`, `job-detail-drawer.tsx` | Share button wiring pattern |

## Similar Implementations

### Messages Inbox

- **Location:** `components/messages/messages-inbox.tsx`
- **Relevance:** DM conversation list with client-side search filter
- **Key patterns:** `useMemo` filter, avatar + name rows, relative timestamps

### Messages View (URL deep-linking)

- **Location:** `components/messages/messages-view.tsx`, `app/(app)/messages/page.tsx`
- **Relevance:** `conversation`, `shareJob` URL params — extend with `shareMember`
- **Key patterns:** Param sync/clear after consume, pass to `MessageThread`

### Person Card / Profile Drawer

- **Location:** `components/people/person-card.tsx`, `person-row.tsx`, `person-profile-drawer.tsx`
- **Relevance:** Share entry points; drawer already has unwired Share button
- **Key patterns:** `pointer-events-auto relative z-10` on action buttons (match job card)

### Attachment UI

- **Location:** `components/ui/attachment.tsx`
- **Relevance:** Composer preview for pending member share before send

### Send Message Actions

- **Location:** `lib/messages/actions.ts`
- **Relevance:** Extend `sendMessage` with optional `sharedProfileId`; no rooms changes

### Message Thread Rendering

- **Location:** `components/messages/message-thread.tsx`, `message-bubble-with-reactions.tsx`
- **Relevance:** `MessageJobShareWithReactions` pattern for member share bubbles

### Realtime Inbox

- **Location:** `lib/messages/hooks/use-inbox-realtime.ts`
- **Relevance:** Skip optimistic append for attachment messages; SWR revalidate

### People Data

- **Location:** `lib/people-data.ts`
- **Relevance:** `Person` type and mock IDs — must align to profile UUIDs for FK validation
