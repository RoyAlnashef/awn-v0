# Getting Started Task Tracking — Shaping Notes

## Scope

Wire the `/now` "Getting started" card so it tracks 7 onboarding tasks and reflects real completion, replacing the static 3-item mock. Add a persisted "Dismiss (Skip this)" footer.

The 7 tracked tasks:

1. Finish your profile
2. Join a group
3. Connect with a member
4. Send an invite
5. Post a Help Now request
6. Create a job
7. Apply to a job

## Decisions

- **Detection = derive from existing Supabase data.** No new tracking tables. A cached server helper (`getOnboardingSignals`) runs 7 existence checks in one `Promise.all` under RLS via the cookie client. Chosen over a new onboarding table or client-only state because every signal already lives in the DB and this is the source of truth that survives refresh/devices.
- **Live same-page updates.** "Join a group" reads the shared `useRoomsList()` SWR store (already mounted on `/now` via `RoomsProvider`), so it ticks the instant a group is joined in the adjacent Choose Groups card. "Post a Help Now request" ticks via an `onPosted` callback from the existing `HelpNowDialog`. The other five actions happen on other pages, so they re-derive on next `/now` load.
- **Dismiss persists per-user in Supabase** via a new `profiles.onboarding_dismissed_at timestamptz` column + a `dismissOnboarding()` server action. Card hides optimistically, stays hidden across reloads/devices.
- **Profile "complete"** = `avatar_url` AND `home_base` present. `availability` is excluded because it is `NOT NULL` with a default (`between_tours`), so it is always set and can't distinguish a completed profile.
- **Invite CTA** points to `/people` (member invite popover) because `/invites` is admin-only and redirects members to `/now`.
- **Progress copy** changes from "Step 1 of 3" to "{completed} of 7 complete".

## Context

- **Visuals:** `visuals/getting-started-mockup.png` — provided card mockup (progress bar, accordion items, CTA button).
- **References:** see `references.md`.
- **Product alignment:** Roadmap Phase 1 "In progress" — "Now page backend: wire check-in map, getting-started checklist, and group selection to Supabase" and "Post-approval onboarding: first-login flow gating and dismiss persistence". This spec delivers the checklist tracking + dismiss persistence slice.

## Standards Applied

`agent-os/standards/index.yml` is currently empty, so no standards are formally registered. UI work follows the same conventions as the sibling `2026-09-22-1726-now-onboarding` spec: semantic design tokens (no raw hex) and shadcn/ui primitives (`Card`, `Accordion`, `Progress`, `Button`).
