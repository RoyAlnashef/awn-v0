# Job Detail Drawer — Shaping Notes

## Scope

Add a job detail flyout drawer on the Jobs page, mirroring the member profile drawer (`PersonProfileDrawer`). Built as a reusable component for future pages (saved jobs, notifications, etc.).

## Decisions

- **Content:** Full detail — badges, role, production, location, pay, dates, deadline, full description, poster info, applicant count; footer with Save + Apply, Message poster, Share, Report job
- **Data:** Fetch `GET /api/jobs/[id]` when drawer opens (not list-only)
- **Poster interaction:** Message poster button only — no nested `PersonProfileDrawer`
- **Trigger:** Stretched button on card/row (same pattern as `PersonCard`); Save/Apply at `z-10`
- **Deferred:** URL deep-linking, Share/Report wiring, nested poster profile, dedicated `/jobs/[id]` page

## Context

- **Visuals:** Member profile drawer reference + jobs grid page in `visuals/`
- **References:** `PersonProfileDrawer`, `JobCard`, `JobRow`, `GET /api/jobs/[id]`
- **Product alignment:** P1 Jobs browse + apply in product roadmap — detail view supports apply/save without leaving the board

## Standards Applied

- `global/board-pattern` — card/row click opens detail without breaking action buttons
- `css/shadcn-ui` — compose from Sheet, ScrollArea, Badge, Button primitives
- `css/design-tokens` — semantic tokens, no hardcoded colors
