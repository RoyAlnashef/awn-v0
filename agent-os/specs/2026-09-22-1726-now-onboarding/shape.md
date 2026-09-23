# Now Page First-Login Onboarding — Shaping Notes

## Scope

Design-first build of the `/now` page in its **new-member first-login** state. One shared set of onboarding components (Choose-your-groups, Getting-started checklist, Who's-around map) rendered statically with mock data, arranged into **two switchable layouts** for side-by-side comparison. A **ButtonGroup toggle in the page header** replaces the current Refresh/Broadcast actions. Map uses real Mapbox GL with a striped CSS fallback when no token is present. No backend wiring this pass.

## Decisions

- **Scope:** Design-first UI with mock data — no API/DB changes.
- **Layouts:** Two switchable arrangements (Layout A two-column, Layout B three-column) sharing the same card components; toggle default = Layout A.
- **Map:** Integrate real Mapbox GL now (`mapbox-gl` + `react-map-gl`); dynamic import with `ssr: false`; striped CSS fallback when `NEXT_PUBLIC_MAPBOX_TOKEN` is missing.
- **Gating:** Render first-login state statically as the default Now page; member detection and dismiss/collapse deferred.
- **Header actions:** Remove Refresh/Broadcast; replace with layout toggle inside client `NowView`.
- **Groups model:** "Choose your groups" maps to discipline community rooms (Musicians, Audio, Lighting & Video, …); Join toggles local state only.
- **Help Now banner:** Shown on mobile for Layout A only; opens existing Help Now dialog.

## Context

- **Visuals:**
  - `visuals/layout-a-desktop.png` — Layout A desktop (two-column)
  - `visuals/layout-a-mobile.png` — Layout A mobile (full page)
  - `visuals/current-now-page.png` — Current empty placeholder (before)
  - `visuals/choose-groups-rows.png` — Choose groups card (row variant)
  - `visuals/mobile-help-now-banner-and-group-chips.png` — Mobile Help Now banner + group chips
  - `visuals/getting-started-accordion-expanded.png` — Getting started accordion (step 1 expanded)
  - `visuals/getting-started-mobile-collapsed.png` — Getting started mobile (all collapsed)
  - `visuals/whos-around-map-desktop.png` — Who's around map with overlays (desktop)
  - `visuals/whos-around-map-mobile.png` — Map mobile with Check in here CTA
- **References:** `app/(app)/now/page.tsx`, `components/page-shell.tsx`, `components/help-now/help-now-dialog.tsx`, `components/ui/button-group.tsx`, `lib/people-data.ts`, `lib/nav.ts`
- **Product alignment:** Phase 1 **Now** tab from `agent-os/product/roadmap.md` — live availability, Help Now urgent crew requests (48h), On The Road check-in map. Addresses placeholder noted in `agent-os/product/misc/feature-migration-inventory.md` §3A.

## Standards Applied

- **css/design-tokens** — semantic Tailwind tokens, no hard-coded colors
- **css/shadcn-ui** — compose from `@/components/ui/*` primitives
- **global/page-shell** — authenticated Now page wraps in `PageShell` with title, description, actions
