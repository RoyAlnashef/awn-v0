# Public Crew Profile Pages — Shaping Notes

## Scope

Build **unauthenticated public profile pages** at `/crew/[handle]` for AWN members. Pages use existing profile data (bio, skills, tour credits, links, work auth, experience). Viewers can download an uploaded resume PDF or, when none exists, trigger a browser print-to-PDF flow with a generated two-column resume layout.

## Decisions

- **Access:** Public — no login required.
- **URL:** `/crew/[handle]` with auto-generated handle from name (slugified); manual editing deferred to a follow-up.
- **Layout:** PersonProfileCard-based public page with full marketing chrome (LandingHeader, centered card, Apply CTA, LandingFooter). Screen layout matches the account preview / in-app Person Card; Aubrey Wright mockups are reference for print resume and marketing tone only.
- **Resume behavior:** Download signed PDF when `profiles.resume_url` exists; otherwise `window.print()` with hidden `CrewResumeDocument` layout.
- **Section toggles:** Deferred — v1 uses a fixed set of resume sections (header, skills, bio, competencies, credits, links, work auth, experience).
- **Profile entry points:** My Account, user dropdown, account preview card, and in-app member card Profile buttons all link to `/crew/{handle}` in a new tab.
- **Data access:** Server-side admin client with strict field whitelist (RLS blocks unauthenticated reads today).
- **Handle backfill:** Active members get slugified `full_name` handles with numeric dedupe suffixes.

## Context

- **Visuals:**
  - `visuals/public-profile-desktop-mockup.jpg` — Aubrey Wright public page (desktop)
  - `visuals/public-profile-mobile-mockup.jpg` — Aubrey Wright public page (mobile)
  - `visuals/print-resume-layout-mockup.jpg` — Print dialog + two-column white resume layout
  - `visuals/account-preview-profile-resume-mockup.png` — Account preview card with Profile and Resume buttons
- **References:** `components/people/person-profile-card.tsx`, `components/account/account-profile-preview.tsx`, `lib/account/profile-data.ts`, `components/account/resume-section.tsx`, `components/account/account-page-actions.tsx`, `lib/supabase/middleware.ts`
- **Product alignment:** Matches `agent-os/product/misc/feature-migration-inventory.md` ("Public crew profile" for unauthenticated visitors) and accelerates `agent-os/product/roadmap.md` Phase 2 SEO crew profiles.

## Standards Applied

None — `agent-os/standards/index.yml` is empty. Follow existing project patterns for marketing pages, server actions, and shadcn UI components.
