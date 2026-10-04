# Member feedback → Supabase — Shaping Notes

## Scope

Replace in-memory feedback persistence and data-URL attachments with Supabase Postgres (`feedback`, `feedback_attachments`) and a private `feedback-attachments` Storage bucket. UI, server action signatures, and admin `/feedback` page stay as built by v0.

## Decisions

- **No SQL seed rows** — admin inbox shows real submissions only after migration is applied locally/production.
- **Single backend** — remove `globalThis.__awnFeedbackStore` and seed data; no fallback in-memory mode.
- **Attachments** — store `storage_path` in DB; `FeedbackAttachment.url` is a signed URL at read time (admin list/detail).
- **Reference IDs** — `FB-{n}` via sequence `feedback_reference_seq` starting at 1008 and a `BEFORE INSERT` trigger.
- **Context JSON** — camelCase keys in `context` jsonb matching [`FeedbackContext`](../../../lib/feedback/types.ts).
- **Submitter** — only `user_id` on row; name/email/avatar from `profiles` join when listing.
- **Migrations** — manual apply in Supabase SQL Editor; agents do not run SQL against the project.

## Context

- **Visuals:** `visuals/member-feedback-form.png`, `visuals/admin-feedback-inbox.png`
- **References:** `lib/moderation/actions.ts`, `lib/applications/actions.ts`, member_reports migration
- **Product alignment:** Feedback triage admin in `agent-os/product/roadmap.md`

## Standards Applied

- `global/page-shell` — existing Feedback page already uses PageShell + nav metadata
- `global/sidebar-nav` — Feedback already in `adminNav`
- Migration/RLS conventions from member_reports and error_logs migrations
