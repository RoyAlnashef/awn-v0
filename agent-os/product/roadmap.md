# Product Roadmap

## Phase 1: MVP

Core network rebuild on Next.js 16 + Supabase. Most of the social graph is live; active work focuses on finishing the Now page and onboarding flows.

### Shipped

- **Invite-only onboarding** — invite-token signup, public request-access, pending gate, admin approve/deny with email
- **Jobs** — post, browse, filter, apply, save, my-jobs tabs, applicant review, accept-with-DM
- **Help Now** — urgent 48h crew callouts as job postings
- **People** — searchable member directory with department, city, availability, work auth, and venue tier filters; connect/disconnect
- **Groups** — community chat rooms with join/leave, private gates, mentions, replies, reactions, and admin settings
- **Messages** — DMs with realtime, reactions, replies, unsend, job/member sharing; popout windows
- **Profile & account** — profile edit, tour credits CRUD, resume upload, social links, avatar/banner
- **Peer-verified tour credits** — credit vouching from People profiles; push on vouch
- **Member invites** — invite codes with quota, send/rescind, member invite popover
- **Public crew profiles** — public `/crew/[handle]` pages
- **Push notifications** — Web Push + FCM + APNs dispatch; in-app notification center (DMs, mentions, application updates, vouches)
- **Admin panel** — users, applications, invites, email templates/broadcasts, error logs
- **Capacitor native shells** — iOS/Android remote URL wrappers

### In progress

- **Now page backend** — wire check-in map, getting-started checklist, and group selection to Supabase
- **Live availability on Now** — full status picker on Now page (toggle exists in nav today)
- **Post-approval onboarding** — first-login flow gating and dismiss persistence
- **Push notification preferences** — persist toggles; wire coming-soon alert types
- **Accept application with DM** — auto-DM on membership approval

## Phase 2: Post-Launch

- **Intel (Road Intel / Atlas)** — community Q&A, venue/vendor atlas, partner deals
- **The List** — curated industry contacts with community contribution and vetting
- **Employer billing & paywall** — Stripe checkout, employer role UX, pricing TBD
- **Installable PWA** — web manifest and install prompt
- **Profile endorsements & network** — profile-level vouches; real following/network graph
- **Work history & tours** — structured tour records linked to verified credits
- **Admin analytics** — usage and engagement dashboard
- **Notification digests & alerts** — saved job alerts, Help Now push, morning brief, weekly/employer digests
- **App Store submissions** — iOS App Store + Google Play
- **Availability habits & nudges** — reminders to keep availability fresh
- **Pagination & performance** — cursor-based pagination; query hardening
- **Growth mechanics** — referrals, onboarding sequences, availability streaks
- **Expanded messaging** — message search, media attachments
- **Employer shortlist & hiring tools** — save crew for roles
- **People trust features** — watch availability, suggested connections, report member
- **Feedback triage admin** — review member feedback submissions
- **Global search** — cross-crew, jobs, and venues search
- **Expanded Road Intel** — deeper venue DB, vendor ratings, lifestyle perks by market
