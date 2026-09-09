# Jobs Urgent Wiring — Complete the Inventory Gaps

## Shaping Summary

**Scope (confirmed):**

- Persist `kind` on edit (PATCH) with bidirectional full ↔ urgent conversion
- Show Urgent badge on grid `JobCard` and align card/preview components with list/detail patterns
- Fix live preview quirks for urgent posts (deadline chip, mapper defaults)
- Remove unused mock `jobs` array from `lib/jobs-data.ts`
- **Deferred:** Follow poster, Report job (social/moderation — not in this spec)

**Visuals:** None — reuse existing `JobRow` and `JobDetailContent` badge patterns.

**Product alignment:** Urgent Help maps to AWN's 48-hour crew callouts (`agent-os/product/mission.md`). Jobs board wiring is P1 per `feature-migration-inventory.md`.

## Current Gap (from inventory)

| Layer      | Today                                           | Target                                            |
| ---------- | ----------------------------------------------- | ------------------------------------------------- |
| Create     | `kind` + `expires_at` saved                     | unchanged                                         |
| Edit PATCH | ignores `kind`                                  | update `kind`, `expires_at`, `deadline`, `status` |
| Grid card  | engagement badge only                           | engagement + department + Urgent (match row)      |
| Preview    | Urgent badge OK; deadline chip wrong for urgent | hide deadline chip when `kind === "urgent"`       |
| Mock data  | 8 unused jobs in `lib/jobs-data.ts`             | remove                                            |

---

## Task 1: Save Spec Documentation

Create `agent-os/specs/2026-08-13-1830-jobs-urgent-wiring/` with plan, shape, standards, references, visuals.

## Task 2: API — Persist `kind` on PATCH

Add `kind` to PATCH handler and `UpdateJobPayload`. Shared helper in `lib/jobs/kind.ts`.

## Task 3: UI — Urgent Badge on JobCard

Match `JobRow` header badges on grid cards.

## Task 4: Preview Fixes

Hide deadline chip for urgent; fix `formToPreviewJob`; remove dead `JobCardPreview`.

## Task 5: Cleanup Mock Jobs Data

Remove unused `jobs` array and `job()` helper from `lib/jobs-data.ts`.

## Task 6: Smoke Check

Manual verification checklist documented in `smoke-check.md`.

---

## Out of Scope (explicitly deferred)

- Follow poster button
- Report job button
- Urgent filter on jobs board
- Separate Help Now / Now-tab integration
