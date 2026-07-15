# Product Roadmap

## Phase 1: MVP (Founding Member Launch — in progress)

The core network is live at awrightnetwork.com with ~29 approved founding members. The MVP scope:

- **Invite-only onboarding** — invite codes, manual admin approval, 5-step profile setup
- **Now tabpage** — live availability status, Help Now urgent crew requests (48h), On The Road check-in map
- **Jobs page** — post and browse job listings, apply with profile, employer shortlist
- **People page** — searchable vetted member directory with role, city, availability, work auth, tour tier
- **Messages page** — direct messages and discipline-specific community rooms with realtime updates
- **Intel page** — community Q&A, venue/vendor atlas, partner deals, The List industry contacts
- **Profile page** — rich touring profile with credits, work history, peer endorsements, invite codes
- **Peer-verified credits** — credit endorsement system; verified badge at 2+ peer vouches
- **Web push notifications** — DMs, Help Now, job matches, morning brief, profile views, vouches
- **Admin panel** — approve applications, manage members, broadcast emails, analytics
- **Employer billing** — Stripe subscription checkout (paywall activation pending launch)
- **PWA + Capacitor shells** — installable web app; iOS and Android native shells built, pending App Store submission (Apple DUNS in progress, Android holding for simultaneous launch)

## Phase 2: Post-Launch

- **App Store submissions** — iOS App Store + Google Play simultaneous launch
- **Employer paywall activation** — pricing TBD; Stripe wiring already in place
- **Modular refactor** — break up the monolithic `page.tsx` into maintainable feature modules
- **SEO crew profiles** — public `/crew/[handle]` profile pages indexed for organic discovery (Rostr playbook)
- **Availability habits & nudges** — automated reminders to keep availability signal fresh; weekly digest
- **Expanded Road Intel** — deeper venue database, vendor ratings, lifestyle perks by market
- **Tours & work history** — structured tour records linked to verified credits and shared-credits graph
- **Pagination & performance** — replace full-table fetches with cursor-based pagination; address known RLS and privacy issues
- **Verified system audit** — complete removal of verification feature gates; badge-only model
- **Weekly / employer digests** — automated email cadences for member engagement and employer retention
- **Growth mechanics** — referral incentives, onboarding email sequences (Day 3 / Day 7 crons), availability streaks
- **Expanded messaging** — message search, thread replies, media attachments
- **The List expansion** — community-contributed industry contacts with vetting workflow
