# Design Tokens & Typography

Use semantic Tailwind tokens from `app/globals.css`. Do not hard-code colors.

```tsx
// Prefer
className="bg-card text-muted-foreground border-border font-heading"

// Avoid
className="bg-white text-[#666] font-[EB_Garamond]"
```

- Colors: `background`, `foreground`, `card`, `muted`, `primary`, `border`, `sidebar-*`, etc.
- Body/UI: default sans (`Nunito_Sans` via `--font-sans`)
- `font-heading` (`EB_Garamond`): titles, brand marks, key emphasis (e.g. pay rates) — not body paragraphs
- Prefer `text-pretty` / `text-balance` on readable multi-line copy
- Add new brand colors as CSS variables + theme tokens, never one-off hex in components
