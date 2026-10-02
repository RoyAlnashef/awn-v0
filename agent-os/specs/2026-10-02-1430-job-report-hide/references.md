# References for Job Report, Hide, and Under Review

## PersonProfileInteractiveFooter

- **Location:** `components/people/person-profile-interactive-footer.tsx`
- **Relevance:** Flag drop-up (`side="top"`), report slide-up footer, thank-you state

## Member moderation

- **Location:** `lib/moderation/actions.ts`, `supabase/migrations/20261001190000_member_reports_and_blocks.sql`
- **Relevance:** RLS, dismiss, list reports, server action auth

## Admin job reports table

- **Location:** `components/reports/member-reports-table.tsx`
- **Relevance:** Table, search, pagination, row actions, profile drawer

## Job pause semantics

- **Location:** `lib/jobs/format.ts` (`draft` = Paused), `app/api/jobs/route.ts` (open-only board)
