---
name: Email Template Editing
overview: Let admins edit copy for all 10 email templates from `/email/templates` via an edit icon that swipes the left column to a structured form, with live preview, DB-backed saves, add/remove paragraphs, and a discard confirm on Back when dirty.
todos:
  - id: save-spec
    content: "Task 1: Save spec docs to agent-os/specs/2026-09-01-1600-email-template-editing/"
    status: completed
  - id: db-migration
    content: "Task 2: email_template_content migration + RLS"
    status: completed
  - id: content-registry
    content: "Task 3: template-content.ts registry + refactor render functions"
    status: completed
  - id: server-actions
    content: "Task 4: template-actions.ts get/save with requireAdmin"
    status: completed
  - id: wire-sends
    content: "Task 5: Wire invite + application send paths to saved content"
    status: completed
  - id: editor-ui
    content: "Task 6: Template list↔form swipe UI with structured fields + live preview"
    status: completed
  - id: polish
    content: "Task 7: Unsaved-changes popover, slide transition, Supabase copy refresh, toasts"
    status: completed
isProject: false
---

# Email Template Editing

**Spec folder:** `agent-os/specs/2026-09-01-1600-email-template-editing/`

See `shape.md`, `standards.md`, and `references.md` for shaping context.

## Summary

Admins edit email copy on `/email/templates` without code deploys.

| Action | Result |
|--------|--------|
| Row click | Preview only — list stays visible |
| Edit icon | Preview switches + left column swipes to edit form |

Editable: subject, preview line, heading, paragraphs (add/remove), button label. Saves go to `email_template_content` and apply to Resend sends. Supabase templates update preview + Copy HTML (manual Dashboard paste still required).

## Implementation map

| Area | Files |
|------|-------|
| Migration | `supabase/migrations/20260901160000_email_template_content.sql` |
| Content registry | `lib/email/template-content.ts` |
| Server actions | `lib/email/template-actions.ts` |
| Send wiring | `lib/invites/actions.ts`, `lib/applications/actions.ts` |
| UI | `components/email/templates/*` |
