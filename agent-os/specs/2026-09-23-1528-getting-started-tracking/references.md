# References for Getting Started Task Tracking

## Component / UI being changed

### Getting Started card (target of the rework)

- **Location:** `components/now/getting-started-card.tsx`
- **Relevance:** The static checklist UI. Rework to consume dynamic status, render completed icons, per-item CTAs, and the Dismiss footer.

### Now page composition

- **Location:** `components/now/now-view.tsx`, `app/(app)/now/page.tsx`
- **Relevance:** Server page fetches signals in parallel and passes them down; `NowView` mounts the card + `HelpNowDialog` and owns the `helpNowPosted` bridge.

### Checklist data model

- **Location:** `lib/now/now-data.ts`
- **Relevance:** `ChecklistItemId` union + `checklistItems` array. Widen to 7 items.

## Completion signals (existing DB access patterns to mirror)

| Task | Table | Key columns | Reference file |
| ---- | ----- | ----------- | -------------- |
| Profile complete | `profiles` | `avatar_url`, `home_base` | `lib/account/profile-actions.ts`, `lib/account/profile-data.ts` (`MEMBER_PROFILE_SELECT`) |
| Join a group | `room_memberships` | `profile_id`, `room_id` | `lib/rooms/actions.ts` (`joinRoom`, `listRooms`), `lib/rooms/hooks/use-rooms-list.ts` (`RoomRecord.joined`) |
| Connect with a member | `member_connections` | `requester_id`, `recipient_id`, `status='accepted'` | `lib/people/actions.ts` |
| Send an invite | `member_invites` | `inviter_id` | `lib/invites/actions.ts` (`listMyInvites`, `sendInvite`) |
| Post a Help Now request | `job_postings` | `poster_id`, `kind='urgent'`, `status!='deleted'` | `app/api/jobs/route.ts`, `lib/jobs/help-now.ts` |
| Create a job | `job_postings` | `poster_id`, `status!='deleted'` | `app/api/jobs/mine/route.ts` |
| Apply to a job | `job_applications` | `applicant_id`, `status!='withdrawn'` | `app/api/jobs/[id]/apply/route.ts` |

## Infrastructure patterns

- **Supabase server client:** `lib/supabase/server.ts` -> `createClient()` (cookie-based, RLS).
- **Current user id on server:** `lib/auth/get-session-user.ts` -> `getSessionUser()` (cached).
- **Server action pattern:** `lib/invites/actions.ts` (`"use server"`, auth-checked inside the action, `revalidatePath`).
- **Live client store:** `components/rooms/rooms-provider.tsx` (`useRooms`) / `lib/rooms/hooks/use-rooms-list.ts` (SWR).
- **Migration convention:** `supabase/migrations/2026*.sql` (timestamped slug, `add column if not exists`, `comment on column`).

## Live update bridge

- `HelpNowDialog` (`components/help-now/help-now-dialog.tsx`) — add optional `onPosted?: () => void` fired after successful `createJob`, so the card can tick "Post a Help Now request" without a reload.
