# Accept Application with DM — Shaping Notes

## Scope

When a recruiter accepts a job application, the review drawer stays open and transitions to an inline note composer. Clicking **Start the conversation** atomically approves the application, creates a DM thread with the recruiter's note (and job attachment), and notifies the applicant.

## Decisions

- Accept + DM + notifications happen together on **Start the conversation** (not on initial Accept click)
- Applicant receives **both** a Jobs-tab `application_accepted` notification and a standard `dm_message` notification
- Drawer stays open throughout; success state offers **View conversation**
- Note text is required before submit
- Maybe/Decline unchanged (no notes)

## Context

- **Visuals:** `visuals/application-review-drawer.png`, `visuals/notifications-jobs-tab.png`
- **References:** job-application-review-drawer, lib/messages/actions, lib/applications/actions, components/notifications
- **Product alignment:** Employer-to-crew hiring workflow + private messaging (mission.md)

## Standards Applied

- css/shadcn-ui — drawer footer, textarea, button variants
