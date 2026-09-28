# References for Check-in Component Polish

## Code being changed

### Who's Around card + surface

- **Location:** `components/now/whos-around-card.tsx`
- **Relevance:** Holds `OnTheRoadSurface` (rename → shared `CheckInSurface`), the inline card, and the expand dialog. Owns the lifted shared state (`mapData`, `query`, `note`, `viewMode`, popover flags, `flyTo`, `dialogOpen` + `dialogIntent`).
- **Key patterns:** Card ⇄ dialog share one surface; disabled search `Input` → `InputGroup`; large overlay card → compact "N checked in nearby" pill.

### Now map

- **Location:** `components/now/now-map.tsx`
- **Relevance:** One `Marker` per member today → supercluster bundles by zoom/bounds; self ping dot → "YOU" orange-ring marker.
- **Key patterns:** Dynamic import with `ssr: false`, striped CSS fallback when Mapbox token missing; `flyTo` + `getClusterExpansionZoom` on bundle click.

### Check-in data layer

- **Location:** `lib/now/check-in.ts`
- **Relevance:** `CheckedInMember`, `CheckInMapData` (`ownCheckIn`), `getCheckInMapData`, `buildCheckInMapDataFromCoords`, `fetchFreshCheckInsInBox`, `CHECK_IN_TTL_MS`.
- **Key patterns:** Add `note`; extend `ownCheckIn` with `checkedInAt` + `note`; select `note` in the fresh-in-box query.

### Check-in server actions

- **Location:** `lib/now/actions.ts`
- **Relevance:** `checkInAtLocation` (extend with `note`), new `checkInBySearch({ query, note })`, new `clearCheckIn()`.
- **Key patterns:** `"use server"`, `getSessionUser()` auth guard, `revalidatePath("/now")`, upsert one row per member.

### Geocoding helper

- **Location:** `lib/now/geo.ts`
- **Relevance:** `geocodePlace` used server-side by `checkInBySearch` (free-text place → coordinates) and by GPS reverse-geocode to a city label.
- **Key patterns:** Mapbox token stays server-side; no raw geocode exposed to client.

### Migration

- **Location:** `supabase/migrations/20260923170700_create_check_ins.sql`
- **Relevance:** Base `check_ins` table; new migration `supabase/migrations/<ts>_add_check_in_note.sql` adds `note text` (<= 80 chars), manual-run per existing header convention, RLS unchanged, updates the table comment.

## UI primitives to compose

- **`components/ui/input-group.tsx`** — search bar (`InputGroupAddon`, `InputGroupButton`) with leading search icon + trailing pin/X.
- **`components/ui/popover.tsx`** — check-in / edit / bundle popovers.
- **`components/ui/textarea.tsx`** — note field with `N / 80` counter.
- **`components/ui/avatar.tsx`**, **`components/ui/button.tsx`** — checked-in header chip.

## Reused feature components

### Board view toggle (Jobs + People)

- **Location:** `components/board-view-toggle.tsx`, `lib/board-view-mode.ts`; used by `components/jobs/jobs-board.tsx` (via `components/jobs/jobs-view-toggle.tsx`) and `components/people/people-board.tsx`.
- **Relevance:** The exact segmented `Button` group (`LayoutGrid` + `List`) to reuse for the Now Map/List toggle — see `visuals/view-toggle-reference.png`.
- **Key patterns:** `inline-flex` bordered container, `size="icon-sm"` buttons, `variant` `secondary`/`ghost` for active/inactive, `aria-pressed` + `aria-label`. Currently hardcoded to `grid`/`list`; generalize for `map`/`list` (use lucide `Map` icon for the map option) while keeping identical markup/styling.

### People board card + drawer

- **Location:** `components/people/person-card.tsx`, `components/people/person-profile-drawer.tsx`
- **Relevance:** Single-member popover keeps `CheckInMemberPopover`/`PersonCard`; list rows and bundle rows open `PersonProfileDrawer`.
- **Key patterns:** Do not invent a parallel card; reuse existing card + drawer.

## New components to add

- `components/now/check-in-form-popover.tsx` — check-in + edit forms (place label / location input, note `Textarea` + counter, submit/cancel).
- `components/now/check-in-bundle-popover.tsx` — "{city} · N crew" header + member rows.

## New dependency

- **`supercluster`** — geographic clustering for map bundles (`getClusters`, `getClusterExpansionZoom`).

## Prior spec

- **Location:** `agent-os/specs/2026-09-23-1707-check-in-map/`
- **Relevance:** The base check-in map wiring this spec polishes. Reuse its data model, auth patterns, and visuals as the current-state baseline.
