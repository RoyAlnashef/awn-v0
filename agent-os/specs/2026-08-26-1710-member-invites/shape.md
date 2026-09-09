# Member Invites — Shaping Notes

## Scope

Build the end-to-end member invites and application review system for AWN:

- **Members** invite specific people by email (up to 5 slots) — managed via a drawer on the People page.
- **Invitees** receive an email, create credentials with a password (no magic-link signup), complete an application form (name, title, resume, social links), and can return to check application status.
- **Admins** review applications in `/applications` — see the inviter, click social links, view the resume, approve or deny with an optional note and visibility control.
- **Notifications** are bootstrapped from static mock data to a real Supabase-backed system, starting with invite-accepted and application-denied events.

## Decisions

- **Invite mechanism:** Direct email-per-person invites only — each invite sends a unique token link (`/apply?token=TOKEN`) to the invitee. Personal shareable invite codes are deferred.
- **Invite limit:** Members can send up to 5 email invites; rescinding a pending invite returns the slot.
- **Member UI:** Drawer on People page (triggered from `PageShell` actions) — not a separate page for members.
- **Signup auth:** Password-based credentials at application time; magic link remains login-only (`shouldCreateUser: false` on OTP).
- **Approval gate:** New `is_approved` flag on profiles; unapproved authenticated users redirect to `/pending`.
- **Auth account creation:** At application submit via `admin.auth.admin.createUser` with `email_confirm: true`; profile stub with `is_approved = false`.
- **Email provider:** Resend for transactional emails (invite, confirmation, approval, denial).
- **Notifications scope:** Full infrastructure — DB table, server actions, real persistence, SWR fetch in panel — scoped to invite events first.
- **Denial notes:** Admin can leave optional note; visibility toggle for invitee-only vs. both invitee and inviter.
- **Migration rule (hard):** Agents create `.sql` migration files only. Never run migrations against Supabase.

## Context

- **Visuals:** `admin-invites-placeholder.png`, `admin-applications-placeholder.png`, `people-page-header.png`
- **References:** Admin Users page/table, People directory + profile drawer, notifications panel (mock), login form auth patterns, prior product notes in `_tmp-invite-flow-summary.md`
- **Product alignment:** Invite-only curated network (mission); Resend + Supabase Storage for resumes (tech stack); trust moat via manual admin approval before full access

## Standards Applied

- global/page-shell — People, Invites, Applications pages use PageShell with optional actions slot
- global/board-pattern — Admin tables follow filter + list + empty state conventions where applicable
- css/shadcn-ui — Drawer, dialog, form, and table UI compose from `@/components/ui/*`

## Deferred (Phase 2+)

- Personal shareable invite codes (`/apply?code=CODE`) — members get a reusable link to share outside email invites
- Waitlist (`/apply` without a token)
- Employer path (`/hire`)
- Onboarding wizard post-approval
- Admin re-send magic link / bulk approve
- Push/browser notifications
- Full `/notifications` page
