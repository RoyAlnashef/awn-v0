# Jobs Urgent Wiring — Shaping Notes

## Scope

Complete the jobs urgent-posting gaps from the inventory audit:

- Persist `kind` on edit (PATCH) with bidirectional full ↔ urgent conversion
- Show Urgent badge on grid `JobCard` and align card/preview with list/detail patterns
- Fix live preview deadline behavior for urgent posts
- Remove unused mock `jobs` array from `lib/jobs-data.ts`

## Decisions

- **Kind conversion:** Both directions allowed (full ↔ urgent) with correct `expires_at` / `deadline` / `status` updates
- **Urgent → full:** Clear `expires_at`; deadline from form body when provided
- **Full → urgent:** Set `expires_at` to now + 48h, clear `deadline`, force `status = open`
- **Follow / Report:** Deferred — not in this spec
- **JobMetaBadges extract:** Copy badge pattern from `JobRow` unless a shared component keeps diff small

## Context

- **Visuals:** None — reuse existing `JobRow` and `JobDetailContent` patterns
- **References:** Jobs backend spec, account jobs spec, POST/PATCH routes, job form page
- **Product alignment:** Urgent Help = 48-hour crew callouts per mission.md; jobs are P1 in migration inventory

## Standards Applied

- `board-pattern` — grid/list card consistency for jobs board
- `shadcn-ui` — Badge primitives for Urgent indicator
