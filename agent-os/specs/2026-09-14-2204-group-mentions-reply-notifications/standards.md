# Standards for Group @ Mentions and Reply Notifications

The following standards apply to this work.

---

## css/shadcn-ui

Build UI from `@/components/ui/*`. Compose with `cn()` from `@/lib/utils`.

- Prefer existing primitives over one-off styled elements
- Feature UI lives in `components/[feature]/`
- Mention picker uses Popover (desktop) and Sheet (mobile)

---

## css/design-tokens

Use semantic Tailwind tokens from `app/globals.css`. Do not hard-code colors.

- Mention links: `text-primary`, no underline
- Colors: `background`, `foreground`, `primary`, `border`, etc.
