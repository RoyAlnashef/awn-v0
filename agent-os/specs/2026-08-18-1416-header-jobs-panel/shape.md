# Header Jobs Panel — Shaping Notes

## Scope

Add a Jobs icon button to the site header (before Notifications) that opens a right-side Sheet panel matching Messages/Rooms/Notifications. The panel includes:

1. **Urgent Jobs carousel** at the top — real data from `GET /api/jobs?kind=urgent`
2. **Notification-style list** — mock saved-job updates (deadline, filled, reposted)
3. **Saved searches — Coming soon** placeholder section

## Decisions

- Notification list uses **mock/static data** (same approach as `components/notifications.tsx`) until a jobs-notifications backend exists
- Header order: **Rooms → Messages → Jobs → Notifications**
- Saved job search matches: **coming soon** placeholder section in the panel
- Urgent carousel click opens `JobPreviewDrawer` (keeps user on current page)
- Footer CTA: "View all jobs" → `/jobs`

## Context

- **Visuals:** Header nav, Messages panel, Rooms panel, Notifications panel (see `visuals/`)
- **References:** `components/notifications.tsx`, `components/messages.tsx`, `components/jobs/job-card.tsx`, `app/api/jobs/route.ts`
- **Product alignment:** Supports mission.md "Help Now" urgent 48-hour crew callouts and job discovery from the header

## Standards Applied

- `board-pattern` — reuse job card styling and urgent tokens for carousel slides
- `shadcn-ui` — Sheet, Carousel, ScrollArea, Button primitives
