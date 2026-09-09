# Account Profile Preview Layout — Shaping Notes

## Scope

Restructure the My Account page from a 2-column sidebar layout into a 12-column grid: left 8 cols (horizontal nav + sub-page content), right 4 cols (live profile card preview). Convert vertical AccountNav to a left-aligned horizontal tab bar above sub-pages. Remove Contact Card from desktop header actions; keep it on mobile.

## Decisions

- Preview mode: Full WYSIWYG card as others see it; footer actions render but are disabled/non-functional in the desktop preview column
- Live updates: Shared client state lifts profile-relevant fields from Profile, Tour Credits, and Social sections
- Breakpoint: `lg` (1024px) — preview visible and Contact Card hidden at `lg+`
- Extract `PersonProfileCard` from `PersonProfileDrawer` to keep mobile drawer and desktop preview visually identical

## Context

- **Visuals:** contact-card-reference.png, account-form-reference.png, account-sidebar-layout-reference.png
- **References:** person-profile-drawer.tsx, account/layout.tsx, account-nav.tsx, account-page-actions.tsx, tabs.tsx, people-data.ts
- **Product alignment:** Extends My Account hub (2026-07-30-1807-my-account-page) with WYSIWYG editing before backend wiring

## Standards Applied

- page-shell — single PageShell wrapper for account routes
- shadcn-ui — compose from existing ui primitives
- design-tokens — semantic Tailwind tokens only
