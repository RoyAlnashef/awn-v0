# Smoke Check — Member Invites

Run after applying migrations in Supabase SQL Editor and configuring Resend. Use Inbucket (local port 54324) or a real inbox for email checks.

## Prerequisites

- [x] Migration applied: `member_invites`, `membership_applications`, `notifications` tables exist
- [x] Migration applied: `profiles.is_approved` column exists; existing active members backfilled to `is_approved = true`
- [x] Migration applied: `pending` added to `user_status` enum
- [x] `.env.local` has `RESEND_API_KEY` and email sender configured
- [x] Supabase Storage bucket for resumes exists with appropriate policies
- [x] Test accounts ready:
  - **Member** — active, approved member (not admin)
  - **Admin** — owner or admin role
  - **Fresh emails** — 6+ addresses you control for invitee testing

---

## Member Invites Drawer (People page)

- [x] "Invite" button appears in the People page header (right side of PageShell actions)
- [x] Clicking Invite opens the drawer
- [x] Drawer shows remaining invite slots (e.g. "3 of 5 remaining")
- [x] Enter a valid email → Send → invite appears in the list with **Pending** status
- [ ] Invitee receives invite email with CTA link to `/apply?token=TOKEN`
- [ ] Sending to the same email twice shows an error (duplicate active invite)
- [ ] Invalid email format shows validation error
- [ ] After 5 active invites, send button is disabled and slot counter shows 0 remaining
- [ ] **Admin/Owner** drawer shows **"Unlimited invites"** (not "X of 5 remaining")
- [ ] **Admin/Owner** can send more than 5 active invites; send button stays enabled
- [ ] **Rescind** on a pending invite removes it from the list and returns the slot
- [ ] Rescinded invite token no longer works on `/apply`
- [ ] Resending to a previously rescinded email succeeds and uses a new token

---

## Invitee Apply Flow (`/apply?token=TOKEN`)

- [ ] Valid token loads the apply form (no login required)
- [ ] Invalid or expired token shows a clear error state
- [ ] Rescinded token shows a clear error state
- [x] Form is a 3-step wizard with progress indicator (Step X of 3, percentage bar)
- [x] **Step 1 — Credentials:** email (pre-filled, locked), password with show/hide, confirm password with show/hide
- [x] Confirm password must match password; Continue blocked if mismatch or password under 8 characters
- [x] **Step 2 — Professional info:** full name, title / role, resume upload (PDF)
- [x] **Step 3 — Social links:** website, Instagram, X/Twitter, LinkedIn, YouTube
- [x] At least two social links required (Continue/Submit blocked with fewer)
- [x] Back button navigates to previous step and preserves entered data
- [x] Email field is locked to the invited address (cannot change to a different email)
- [x] Resume upload accepts PDF; rejects unsupported file types
- [x] Submit creates auth account with password (no magic-link signup)
- [x] Submit creates `membership_applications` row with status **pending**
- [x] Submit links application to the originating `member_invites` row
- [x] Invite status updates to **accepted** after successful submit
- [ ] Invitee receives confirmation email with link to check application status
- [ ] Submitting with an email that already has an approved account shows an error

---

## Pending / Approval Gate

- [x] After submitting, invitee can log in with their password
- [x] Unapproved user is redirected to `/pending` when visiting app routes (e.g. `/now`, `/people`)
- [x] `/pending` shows application status (pending / denied with note if applicable)
- [x] Unapproved user can still access `/pending` and `/apply/*`
- [x] Unapproved user cannot access the main app shell
- [x] Approved user (existing member) is not affected by the gate

---

## Admin Applications Page (`/applications`)

- [x] Page loads a table of submitted applications (not placeholder)
- [x] Table shows: invitee name, email, title, invited by (member name), submitted date, status badge
- [x] Only admins can access the page; members are redirected or blocked
- [x] Clicking a row opens the review panel
- [x] Review panel shows invitee name, title, email
- [x] Review panel shows **Invited by** with member name and avatar
- [x] Social links render as clickable icons; each opens in a new tab
- [x] Resume renders in a view-only viewer (PDF via signed URL)
- [x] **Approve** updates application status to **approved**
- [ ] **Approve** sets invitee profile `is_approved = true`
- [ ] **Approve** sends approval email to invitee with login link
- [ ] **Approve** creates `invite_accepted` notification for the inviting member
- [ ] After approval, invitee can log in and access the full app
- [ ] **Deny** opens dialog with optional note textarea
- [ ] **Deny** dialog has visibility toggle: invitee only / invitee and inviter
- [ ] **Deny** with note (invitee only) sends denial email to invitee; inviter does not receive notification
- [ ] **Deny** with note (both) sends denial email to invitee and creates `application_denied` notification for inviter
- [ ] **Deny** without note still denies the application; no emails or notifications sent
- [ ] Denied invitee sees denial note on `/pending` when visibility includes them

---

## Admin Invites Page (`/invites`)

- [ ] Page loads a table of all member invites across the network (not placeholder)
- [ ] Table shows: inviter name, invitee email, status, sent date
- [ ] Application link or status visible when invitee has submitted
- [ ] Filter by status works (pending / accepted / rescinded)
- [ ] Only admins can access the page

---

## Notifications Panel

- [ ] Notifications panel loads real data from DB (not static mock array)
- [ ] Unread count badge in header reflects actual unread notifications
- [ ] Inviting member receives **invite accepted** notification when admin approves their invitee
- [ ] Inviting member receives **application denied** notification when admin denies with visibility set to both
- [ ] Mark as read updates the notification and decrements unread count
- [ ] Mark all read clears all unread notifications
- [ ] Notifications persist across page refresh

---

## Email (Resend)

- [ ] **Invite email** — sent on member invite; link contains valid token
- [ ] **Confirmation email** — sent on application submit; link goes to `/pending`
- [ ] **Approval email** — sent on admin approve; login link works
- [ ] **Denial email** — sent on admin deny when note is provided; includes admin note text

---

## Edge Cases

- [ ] Member cannot invite their own email address
- [ ] Member cannot invite an email that already belongs to an active AWN member
- [ ] Two different members can invite the same email address independently
- [ ] Rescinding an invite after the invitee has already submitted is blocked (or shows appropriate state)
- [ ] Magic link login (`shouldCreateUser: false`) still does not create new accounts for unknown emails
- [ ] Password login works for invitees after application submit
- [ ] No console errors on People, Apply, Pending, Applications, or Invites pages

---

## Out of Scope (Deferred — Should Not Work Yet)

- [ ] `/apply?code=CODE` — personal shareable invite codes
- [ ] `/apply` without a token — waitlist
- [ ] `/hire` — employer path
- [ ] Post-approval onboarding wizard
- [ ] Full `/notifications` page
- [ ] Push / browser notifications
