# Job Status Dropdown — Shaping Notes

## Scope

Add a header status dropdown on the Job detail (management) page so recruiters can change job state without leaving the page. The dropdown sits left of the Edit button, shows the current state as the trigger label, and uses shadcn Select styling.

## Decisions

- **Selectable states:** Open, Paused (`draft`), Filled — matches existing Pause behavior on Jobs Posted list.
- **Expired / Deleted:** show current status in the trigger; dropdown offers Open only to reopen.
- **Remove body badge:** header dropdown is the single source of truth; keep "Posted X ago" line.
- **No API changes:** reuse existing `PATCH /api/jobs/[id]` via `updateJob()`.
- **List view unchanged:** Pause button on Jobs Posted rows stays as-is.

## Context

- **Visuals:** Job detail header screenshot + calendar-style select dropdown reference (see `visuals/`).
- **References:** See `references.md`
- **Product alignment:** Employers need fast job lifecycle control from the management view.

## Standards Applied

- css/shadcn-ui — compose from `@/components/ui/select`
- global/page-shell — status control lives in PageShell `actions` via JobPageLayout
