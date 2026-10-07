# Standards for Message thread block and report

---

## css/shadcn-ui

Build UI from `@/components/ui/*`. Compose with `cn()` from `@/lib/utils`.

- Prefer existing primitives over one-off styled elements
- Feature UI lives in `components/[feature]/`
- Don't invent parallel button/input/dialog systems

---

## css/design-tokens

Use semantic Tailwind tokens from `app/globals.css`. Do not hard-code colors.

- Colors: `background`, `foreground`, `card`, `muted`, `primary`, `border`, etc.
- Body/UI: default sans; `font-heading` for titles and key emphasis only
