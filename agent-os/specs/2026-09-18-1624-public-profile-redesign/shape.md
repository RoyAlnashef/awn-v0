# Public Profile Page Redesign — Shaping Notes

## Scope

Redesign the public crew profile page at `/crew/[handle]` from a centered `PersonProfileCard` into a full-page marketing layout matching new desktop and mobile mockups. Visual/layout only — same route, data fetch, resume download/print, and SEO metadata.

## Decisions

- **Scope:** Visual/layout only — no API/DB changes.
- **Footer:** Ignore mockup footer CTA — keep existing `LandingFooter` and current simple apply CTA block.
- **In-app card:** Unchanged — `PersonProfileCard` stays for drawer + account preview.
- **References:** Landing chrome + reuse public-mode data/resume logic from existing crew stack.
- **Tour credits:** Use existing `credit.title` as-is; no artist/title split.
- **Standards:** `css/design-tokens`, `css/shadcn-ui`; `global/page-shell` N/A (marketing route).

## Context

- **Visuals:**
  - `visuals/public-profile-redesign-desktop.png` — full-bleed hero, two-column layout
  - `visuals/public-profile-redesign-mobile.png` — stacked mobile layout with DETAILS table
  - `visuals/public-profile-current-mobile.jpg` — previous centered-card layout (reference)
- **References:** `components/crew/public-crew-profile-page.tsx`, `components/people/person-profile-card.tsx`, `components/landing/landing-header.tsx`, `lib/crew/public-profile.ts`
- **Product alignment:** Improves Phase 2 "SEO crew profiles" from `agent-os/product/roadmap.md` and "Public crew profile" in `agent-os/product/misc/feature-migration-inventory.md`.

## Standards Applied

- **css/design-tokens** — semantic Tailwind tokens, no hard-coded colors
- **css/shadcn-ui** — compose from `@/components/ui/*` primitives
- **global/page-shell** — N/A; marketing route uses LandingHeader/Footer, not PageShell
