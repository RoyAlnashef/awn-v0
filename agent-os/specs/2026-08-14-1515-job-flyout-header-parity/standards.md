# Standards for Job Flyout Header Parity

The following standards apply to this work.

---

## css/design-tokens

Use semantic Tailwind tokens from `app/globals.css`. Do not hard-code colors.

- Colors: `background`, `foreground`, `card`, `muted`, `primary`, `border`, etc.
- Body/UI: default sans (`Nunito_Sans` via `--font-sans`)
- `font-heading` (`EB_Garamond`): titles, brand marks, key emphasis (e.g. pay rates) — not body paragraphs
- Prefer `text-pretty` / `text-balance` on readable multi-line copy

---

## global/board-pattern

Browsable directories use a `*Board` composition with `*Card` and `*Row` variants.

- Job Card is the reference for compact job metadata presentation
- Shared badge component keeps card, row, and flyout in sync
