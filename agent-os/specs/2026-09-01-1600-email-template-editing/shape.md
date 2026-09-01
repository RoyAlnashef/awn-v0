# Email Template Editing — Shaping Notes

## Scope

Admins on `/email/templates` can edit copy for all 10 email templates (4 Resend app emails + 6 Supabase auth emails) without code deploys. The existing split layout stays; the left column gains a list-to-form swipe when editing.

**Two distinct list interactions:**

- **Row click** — switches right-column preview only; list stays visible (nav)
- **Edit icon** — switches preview and swipes left column to structured edit form

**Edit form:** Back returns to list; dirty state triggers confirm popover (Discard / Keep editing); Save persists to DB with toast; live preview via `EmailPreviewProvider`.

**Editable fields:** subject, preview line, heading, dynamic paragraphs (add/remove), button label (when template has CTA).

**Not editable v1:** layout/branding, button URLs, Supabase `footerNote` Go tags, runtime fields (denial note).

## Decisions

- Edit icon uses `stopPropagation` so row click and edit are separate hit targets
- Unsaved changes: confirm popover on Back (Discard changes / Keep editing)
- Paragraphs: admins can add/remove (min 1 enforced in UI)
- Defaults in code, overrides in `email_template_content` JSONB table
- Invite subject/preview/body use `{{inviterName}}` placeholder substituted at send + preview time
- Supabase saves update in-app preview + Copy HTML; admins still paste into Supabase Dashboard

## Context

- **Visuals:** `visuals/admin-emails-current.png` (current Emails screen)
- **References:** admin emails spec split layout, broadcast-actions server pattern, messages master-detail, apply-form back button
- **Product alignment:** Phase 1 admin tooling — brand/tone iteration without deploys

## Standards Applied

- page-shell — page stays in EmailLayoutShell
- sidebar-nav — no nav changes
- design-tokens — semantic tokens for form/preview
- shadcn-ui — Input, Textarea, Button, Popover from `@/components/ui/*`
