# Check-in map wiring

Wire the existing Who's Around map to real check-ins: show nearby network avatars on load (25 miles from home base), let members check in via the browser/app location prompt, then refresh nearby from that pin. Avatar clicks open the same People-board PersonCard, which still opens the profile drawer.

**Folder:** `agent-os/specs/2026-09-23-1707-check-in-map/`

## Scope

Wire the existing Who's Around map on `/now` (currently mock Denver data) so that:

1. On load, the map is covered in avatars of **network members who have an active check-in within ~25 miles of the viewer's `home_base`**.
2. Clicking an avatar (or a nearby-list row) pops the **same small card as the People board** (`components/people/person-card.tsx`). That card still opens `PersonProfileDrawer`.
3. **Check in here** asks for location (browser Geolocation API; native prompt in Capacitor shells) and upserts the member's check-in. After that, nearby is recomputed from the new pin.

Also wire the existing nearby-people list under the map.

**Out of this slice:** search box, Everyone / My crews / Open for work filters, wave, optional check-in note, live realtime subscriptions.

## Decisions

- **Network** = all active AWN members (not just accepted connections).
- **Nearby** = ~25 miles from geocoded `profiles.home_base` on load; after check-in, ~25 miles from the check-in coordinates.
- **TTL** = 24 hours from `checked_in_at`. One active row per member (upsert).
- **Visuals:** the two attached screenshots only (map overlays + member card).
- **Product:** Roadmap Phase 1 "wire check-in map".
- **Standards:** design tokens, shadcn/ui, page-shell, board-pattern (reuse `PersonCard`).

## Task 1: Save Spec Documentation

Create `agent-os/specs/2026-09-23-1707-check-in-map/` with plan, shape, standards, references, visuals.

## Task 2: `check_ins` migration

Add `supabase/migrations/20260923170700_create_check_ins.sql`.

## Task 3: Check-in + nearby server API

New `lib/now/check-in.ts` + `lib/now/actions.ts`. Load initial nearby on `/now`.

## Task 4: Check-in button + location prompt

Wire Geolocation API; add iOS/Android permission strings.

## Task 5: Avatar markers + PersonCard popover

Avatar markers on map; popover with `PersonCard`.

## Task 6: Nearby list overlay

Live city + count + member rows; filters/search inert.

## Verify

Exercise `/now` in the browser: empty home-base, home-base with nearby check-ins, check-in allow/deny, avatar → small card → drawer, list row → card.
