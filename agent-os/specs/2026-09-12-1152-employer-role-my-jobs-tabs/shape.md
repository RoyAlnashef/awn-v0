# Employer Role & My Jobs Tabs — Shaping Notes

## Scope

Add a new `employer` user role that grants job-posting privileges. Members remain job-seekers by default; an AWN admin manually elevates a member to employer via the existing admin panel.

Restructure the My Jobs page from 2 tabs to up to 3 role-aware tabs:

| Tab | Visible to |
|-----|-----------|
| Jobs Posted | Employers, Owners, Admins |
| Saved Jobs | All approved members |
| My Applications | All approved members |

Tab order: Jobs Posted → Saved Jobs → My Applications.

## Decisions

- **Employer approval flow is out of scope** — admins set the role manually in the existing user management UI; no new application/approval queue needed.
- **Members default to `/my-jobs/saved`** — when a non-employer visits `/my-jobs`, they land on Saved Jobs (not Jobs Posted, which they can't see).
- **Employers default to `/my-jobs/created`** — existing behaviour preserved for those who can post.
- **Owners and Admins get full access** — `canPostJobs = role === 'employer' || role === 'owner' || role === 'admin'`.
- **Saved Jobs UI reuses existing infrastructure** — the API endpoint `GET /api/jobs/mine?tab=saved` and `fetchMyJobs("saved")` already exist; only the tab UI and route page are new.
- **Sidebar nav is role-filtered** — the "Jobs Posted" sub-link is hidden from non-employers in `AppSidebar`; "Saved Jobs" is added for everyone.
- **Job creation is gated at both API and UI level** — POST /api/jobs returns 403 for non-employers; the "Post a Job" button is conditionally rendered.

## Context

- **Visuals:** Screenshots of the current My Jobs page (2 tabs: "My Jobs" / "My Applications") and sidebar nav provided by user.
- **References:** See `references.md`
- **Product alignment:** Employers are a distinct monetisation/service tier within AWN — members who have been vetted to hire crew, not just find work.
