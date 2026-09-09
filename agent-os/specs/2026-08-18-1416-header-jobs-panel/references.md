# References for Header Jobs Panel

## Similar Implementations

### Notifications panel (UX template)

- **Location:** `components/notifications.tsx`, `lib/notifications-data.ts`
- **Relevance:** Panel shell, unread styling, mark-all-read, footer CTA, mock local state
- **Key patterns:** Controlled Sheet, lazy mount, notification row markup with accent bar

### Messages panel (lazy fetch)

- **Location:** `components/messages.tsx`, `lib/messages/hooks/use-inbox.ts`
- **Relevance:** SWR fetch only when panel is open (`enabled: open`)
- **Key patterns:** Close sheet before navigate, prefetch on interaction

### Jobs board (data + styling)

- **Location:** `components/jobs/job-card.tsx`, `lib/jobs/format.ts`, `lib/jobs/fetch.ts`
- **Relevance:** Urgent styling tokens, job preview drawer, SWR keys
- **Key patterns:** `JobPreviewDrawer`, `JobUrgentHelpBadge`, `formatJobPostedAt`

### Jobs API

- **Location:** `app/api/jobs/route.ts`
- **Relevance:** List endpoint extended with `kind` query param for urgent carousel

### Carousel primitive

- **Location:** `components/ui/carousel.tsx`
- **Relevance:** First in-app use of Embla carousel for urgent jobs horizontal scroll
