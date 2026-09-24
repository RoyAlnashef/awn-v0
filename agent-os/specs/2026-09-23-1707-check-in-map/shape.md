# Check-in Map Wiring — Shaping Notes

## Scope

Wire the existing Who's Around map on `/now` so that:

1. On load, the map shows avatars of network members with an active check-in within ~25 miles of the viewer's active check-in (if fresh within 24h), otherwise within ~25 miles of geocoded `home_base`.
2. Clicking an avatar (or nearby-list row) opens the same small card as the People board (`PersonCard`), which still opens `PersonProfileDrawer`.
3. **Check in here** triggers the browser/app location prompt and upserts the member's check-in; nearby refreshes from the new pin.

Also wire the existing nearby-people list under the map.

**Out of scope:** search, filter buttons, wave, optional note, realtime subscriptions.

## Decisions

- **Network** = all active AWN members (not just connections).
- **Nearby** = ~25 miles from active check-in on load when one exists (24h TTL); otherwise from geocoded `home_base`. After a new check-in, from the new coordinates.
- **TTL** = 24 hours from `checked_in_at`; one row per member (upsert).
- **Visuals:** attached map + member card screenshots only.
- **Product:** Roadmap Phase 1 "wire check-in map".
- **Standards:** design tokens, shadcn/ui, page-shell, board-pattern (reuse `PersonCard`).

## Context

- **Visuals:** `visuals/check-in-map.png`, `visuals/member-card.png`
- **References:** see `references.md`
- **Product alignment:** Roadmap Phase 1 "Now page backend — wire check-in map"

## Standards Applied

- css/design-tokens — semantic Tailwind tokens, no hard-coded colors
- css/shadcn-ui — compose from `@/components/ui/*`
- global/page-shell — `/now` stays in `PageShell`
- global/board-pattern — reuse `PersonCard`, do not invent a second card
