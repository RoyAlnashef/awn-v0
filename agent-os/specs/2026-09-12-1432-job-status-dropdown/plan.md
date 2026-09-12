# Job Status Dropdown on Job Detail — Plan

## Overview

Add a header status dropdown on the Job detail (management) page so recruiters can switch between Open, Paused, and Filled — with read-only display for Expired/Deleted jobs that can be reopened to Open. Remove the duplicate body status badge.

## Task 1: Save Spec Documentation

Created `agent-os/specs/2026-09-12-1432-job-status-dropdown/` with plan, shape, standards, references, and visuals.

## Task 2: Status config helper

Add to `lib/jobs/format.ts`:

- `jobStatusLabels` — human-readable labels (Paused for draft)
- `employerSelectableStatuses(current)` — returns allowed target statuses

## Task 3: JobStatusSelect component

Create `components/jobs/job-status-select.tsx`:

- shadcn Select, size sm, outline styling
- Calls `updateJob()` on change
- Toast messages per transition
- Disabled while pending

## Task 4: Wire into Job detail

Update `components/jobs/job-management-detail.tsx`:

- Add `JobStatusSelect` left of Edit in header actions
- Local `currentJob` state synced with preview panel
- Remove body status badge; keep posted timestamp

## Task 5: Verify

Manual test transitions: open/paused/filled/expired/deleted reopen.
