# Smoke Check — Jobs Urgent Wiring

Date: 2026-08-13

## Automated checks

| Check | Result |
| --- | --- |
| `kindTransitionPatch` full → urgent sets `expires_at`, clears `deadline`, forces `open` | Pass (tsx script) |
| `kindTransitionPatch` urgent → full clears `expires_at` | Pass (tsx script) |
| Same-kind transition returns null | Pass (tsx script) |
| `normalizeJobKind` / `urgentExpiresAt` (~48h TTL) | Pass (tsx script) |
| Typecheck on changed files | No new errors in touched files (pre-existing errors elsewhere) |
| Linter on changed files | Clean |

## Manual checklist (browser)

Run against `pnpm dev` with a logged-in poster account:

1. **Create urgent** — Post new Urgent Help; confirm Urgent badge on grid card, list row, detail drawer, My Jobs
2. **Edit full → urgent** — Change existing full role to Urgent Help, save; confirm badge everywhere; DB row has `expires_at` ~48h out and `deadline` null
3. **Edit urgent → full** — Reverse conversion; confirm `expires_at` cleared, deadline field available, no Urgent badge
4. **Live preview** — Toggle posting type on edit form; preview shows/hides Urgent badge and deadline chip before save
5. **Expired urgent** — Confirm expired urgent posts filtered from board (`GET /api/jobs` filters `expires_at <= now`)

## Code paths verified

- **PATCH** [`app/api/jobs/[id]/route.ts`](../../app/api/jobs/[id]/route.ts): reads existing `kind`, applies `kindTransitionPatch`, applies `deadline` only when resolved kind is `full`
- **POST** [`app/api/jobs/route.ts`](../../app/api/jobs/route.ts): uses shared `normalizeJobKind` / `urgentExpiresAt`
- **Client** [`lib/jobs/fetch.ts`](../../lib/jobs/fetch.ts): `UpdateJobPayload` includes `kind`
- **Grid card** [`components/jobs/job-card.tsx`](../../components/jobs/job-card.tsx): engagement + department + Urgent badges
- **Preview** [`components/jobs/job-detail-content.tsx`](../../components/jobs/job-detail-content.tsx): deadline chip only for `kind === "full"`
- **Mapper** [`lib/jobs/map.ts`](../../lib/jobs/map.ts): no `end_date` fallback for urgent deadlines
- **Mock cleanup** [`lib/jobs-data.ts`](../../lib/jobs-data.ts): removed unused `jobs` array

## Notes

- Follow poster and Report job remain placeholder UI (out of scope).
- Browser manual steps not run in this session; automated helper tests cover API transition logic.
