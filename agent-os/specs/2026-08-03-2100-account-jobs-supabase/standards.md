# Standards for Account Jobs

---

## page-shell

# PageShell Layout

Every authenticated app page wraps content in `PageShell`.

```tsx
<PageShell title="…" description="…" actions={…}>
  {/* page content */}
</PageShell>
```

- Use `title`, optional `description`, optional `actions`, and `children`
- Pull title/description from `lib/nav` when the page has a nav entry
- No parallel page headers or custom chrome
- No exceptions for app routes under `app/(app)/`

---

## shadcn-ui

# shadcn-First UI

Build UI from `@/components/ui/*`. Compose with `cn()` from `@/lib/utils`.

- Prefer existing primitives over one-off styled elements
- Feature UI lives in `components/[feature]/`
- Don't invent parallel button/input/dialog systems

---

## design-tokens

# Design Tokens & Typography

Use semantic Tailwind tokens from `app/globals.css`. Do not hard-code colors.

- Colors: `background`, `foreground`, `card`, `muted`, `primary`, `border`, etc.
- `font-heading` for titles and key emphasis

---

## board-pattern

# Board + Card/Row Pattern

Browsable directories use a `*Board` composition: filters, result count, grid/list, empty state.

- Empty state: dashed border, icon, short message
- Mirror for new directory-style features
