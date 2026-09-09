# People Directory — Supabase Wiring — Shaping Notes

## Scope

Wire the Find people page and all Person card variants (grid, list, profile drawer, share card) to real Supabase profiles. Add DB schema for department, tour credits, profile vouches, and member connections. Remove all mock `people[]` data and fallbacks.

## Decisions

- **Data source:** Supabase `profiles` table (active members only)
- **Schema additions:** `department` on profiles; `tour_credits`, `profile_vouches`, `member_connections` tables
- **Mock data:** Remove entirely — no fallback anywhere
- **Fetch pattern:** RSC initial load + server actions returning `{ ok, data, error }` unions
- **Migrations:** Manual-only — paste into Supabase SQL Editor

## Context

- **Visuals:** find-people-grid.png, share-card-in-chat.png, share-card-variant.png, card-variations.png
- **References:** account profile Supabase wiring, users page RSC pattern, member share spec
- **Product alignment:** P1 People + trust graph — real availability, peer vouches, connections on member cards

## Standards Applied

- global/board-pattern — PeopleBoard filter + grid/list composition
- global/page-shell — People page uses PageShell
- Server action conventions — `{ ok, error }` unions from messages/users actions
