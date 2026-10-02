# Member Report and Block — Shaping Notes

## Scope

Member report + block from profile card; admin Community Reports triage at `/community-reports/members`; Settings blocked list; mutual hide across People, Now, and groups; existing DMs remain in inbox view-only when blocked.

## Decisions

- Report reasons from UI mockup (six options + Other)
- Submit report only from report form; block separately via flag dropup on profile footer
- Mutual block: hide in directories, group member lists/messages; DMs view-only (no new threads)
- One open report per reporter→reportee; dismiss soft-hides from admin table
- Admin suspend via existing `updateUserStatus`

## Context

- **Visuals:** profile-footer-report.png, report-reason-select.png, admin-users-nav.png
- **References:** job-application-review-footer, applications-table, users-table
- **Product alignment:** roadmap People trust / report member

## Standards Applied

- global/page-shell, global/sidebar-nav, css/shadcn-ui, css/design-tokens
