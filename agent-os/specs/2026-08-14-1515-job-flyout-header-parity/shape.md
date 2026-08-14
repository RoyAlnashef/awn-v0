# Job Flyout Header Parity — Shaping Notes

## Scope

Align the top section of job flyouts and previews with the finalized Job Card layout. My Jobs cards are out of scope for this phase.

The flyout remains the expanded, detailed view of a job — not a 1:1 copy of the card. The card is a compact summary; the flyout adds full description, posted-by, and footer actions on top of the shared header structure.

## Decisions

- **Element order:** Title + Urgent → Tour name → Badge row → Pay rate → Details → Posted By → Footer
- **Pay rate:** Stays above Details section in flyout (not moved to footer like the card)
- **Badge styling:** All metadata badges use uniform `variant="secondary"` matching Job Card — no outline variants or plain-text location lines
- **Applicants badge:** Flyout only; hidden in preview mode
- **Application deadline badge:** Flyout and preview only (not on Job Card)
- **Posted By:** Smaller contact card (size-8 avatar, p-3 padding)

## Context

- **Visuals:** Four comparison screenshots in `visuals/` (standard + urgent, card vs flyout, my-jobs vs flyout)
- **References:** `job-card.tsx`, `job-metadata-badges.tsx`, `job-detail-content.tsx`, prior job-detail-drawer spec
- **Product alignment:** Consistent job presentation across browse, detail, and create/edit preview surfaces

## Standards Applied

- css/design-tokens — semantic tokens, font-heading for titles and pay rates
- global/board-pattern — Job Card/Row as reference implementation for metadata badges
