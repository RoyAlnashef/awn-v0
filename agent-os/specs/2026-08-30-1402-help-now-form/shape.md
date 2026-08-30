# Help Now Form — Shaping Notes

## Scope

Replace the Urgent Help posting experience with a simplified, all-text Help Now form matching the original mockup. Extract as a reusable component for dialogs and future entry points (FAB, `/now` tab). Add a Help Now button to the site header that opens the form in a dialog.

## Decisions

- **TTL:** 48 hours (current backend + product docs); dialog copy reflects 48h
- **Form surfaces:** Reusable `HelpNowForm` in header dialog and when Urgent Help is selected on `/jobs/new`
- **Date & Time storage:** Free-text Date & Time → `production` column (subtitle under role on cards/detail); no DB migration
- **Fixed on submit:** `kind: urgent`, `status: open`, `engagement: One-Off`, placeholder start/end dates default to today
- **Details limit:** 280 characters with counter
- **Out of scope:** Push notifications, DM pre-fill, full `/now` tab feed, edit urgent via Help Now form (follow-up)

## Context

- **Visuals:** `visuals/current-urgent-help-form.png`, `visuals/help-now-mockup.png`, `visuals/header-placement.png`
- **References:** job-form-page, apply-job-dialog, invite-user-dialog, urgent-wiring spec
- **Product alignment:** feature-migration-inventory §3A — modal with role, location, date, rate, description; 48h live window; unified `job_postings.kind = urgent`

## Standards Applied

- `shadcn-ui` — Dialog, Input, Textarea, Button from `@/components/ui/*`
- `page-shell` — N/A for dialog; job form page keeps PageShell via JobPageLayout
- Jobs API conventions — REST under `app/api/jobs/`; SWR revalidation after post
