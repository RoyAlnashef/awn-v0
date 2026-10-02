# Job Report, Hide, and Under Review — Shaping Notes

## Scope

Member report + hide from job detail footer; admin Community reports → Jobs triage; admin-triggered Under Review lock on reported jobs (pause + poster API lock until release or close).

## Decisions

- Report reasons from `agent-os/product/misc/08_Report_Form.txt`
- Hide = board list only (not saved bookmarks)
- Under Review: admin **Put under review** only — not on member report submit
- During review: status `draft` (paused), poster read-only; admin pause + view only in v1
- Release restores `status_before_review`; Close sets `filled` or `deleted`
- Suspend poster remains separate from Under Review

## Context

- **Visuals:** job-detail-footer-before.png (if saved)
- **References:** person-profile-interactive-footer, member_reports migration, member-reports-table
- **Product alignment:** trust / community reports

## Standards Applied

- global/page-shell, global/sidebar-nav, css/shadcn-ui, css/design-tokens
