# Standards for Admin Emails

The following standards apply to this work.

---

## global/page-shell

Every authenticated app page wraps content in `PageShell`. Pull title/description from `lib/nav` when the page has a nav entry.

---

## global/sidebar-nav

Define sidebar items in `lib/nav.ts` (`adminNav`). Add `/email` for the Emails admin section.

---

## css/design-tokens

Use semantic Tailwind tokens from `app/globals.css`. Do not hard-code colors.

---

## css/shadcn-ui

Compose UI from `@/components/ui/*` — Button, Input, Textarea, Badge, AlertDialog, Drawer.
