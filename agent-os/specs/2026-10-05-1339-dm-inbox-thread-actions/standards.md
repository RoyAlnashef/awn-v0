# Standards for DM Inbox and Thread Actions

---

## css/design-tokens

Use semantic Tailwind tokens from `app/globals.css`. Do not hard-code colors.

- Colors: `background`, `foreground`, `card`, `muted`, `primary`, `border`, etc.
- `font-heading` for titles where appropriate
- Destructive actions use `text-destructive` semantic token

---

## css/shadcn-ui

Build UI from `@/components/ui/*`. Compose with `cn()` from `@/lib/utils`.

- Prefer existing primitives over one-off styled elements
- Feature UI in `components/messages/`
- DropdownMenu, AlertDialog, Button for inbox actions

---

## global/page-shell

Messages page uses existing split-pane layout; no new PageShell chrome.

---

## global/sidebar-nav

DM unread badge uses `get_dm_unread_count`; must respect mute/archive/hidden filters in RPC.
