# Standards for Member Feedback → Supabase

---

## global/page-shell

Every authenticated app page wraps content in `PageShell`.

- Pull title/description from `lib/nav` when the page has a nav entry
- Feedback admin page already follows this at `/feedback`

---

## global/sidebar-nav

- Define sidebar items in `lib/nav.ts` (`adminNav`)
- Feedback entry: `href: "/feedback"` — no change required for Supabase wiring

---

## Database migrations (project convention)

From member_reports and error_logs migrations:

- File header: **IMPORTANT: Run manually in the Supabase SQL Editor. Agents must NEVER execute against the project.**
- Enable RLS on new tables
- Admin access via `public.is_admin()` where appropriate
- Service-role-only inserts for sensitive child rows when app validates auth in server actions
