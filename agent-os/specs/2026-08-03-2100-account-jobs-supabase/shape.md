# Account Jobs — Shaping Notes

## Scope

Wire `/account/jobs` to Supabase: live **Created** and **Saved** tabs, **Post a job** via `PostJobDialog`, **Edit** own postings, **Unsave** on Saved tab, and **draft** status support.

## Decisions

- Full pass: Created + Saved + Post + Edit + Unsave
- Add `draft` to `job_status` enum; show raw DB status labels in UI
- Reuse REST + SWR jobs stack (not server actions)
- Reuse `PostJobDialog` with custom outline trigger on account page

## Context

- **Visuals:** account-jobs-created.png, account-jobs-saved.png, post-role-dialog.png
- **References:** jobs-section.tsx, post-job-dialog.tsx, /api/jobs routes, lib/jobs/*
- **Product alignment:** Jobs marketplace core to AWN mission; completes My Account content hub

## Standards Applied

- page-shell — account layout conventions
- shadcn-ui — dialog, tabs, buttons
- design-tokens — semantic colors for status badges
- board-pattern — list/card pattern for job rows
