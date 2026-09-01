# Standards for Email Template Editing

The following standards apply to this work.

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

## sidebar-nav

# Sidebar Navigation

Define sidebar items in `lib/nav.ts` (`mainNav` / `adminNav`). Don't hard-code nav arrays in the sidebar.

- Add primary app routes to `mainNav` or `adminNav` when they belong in the sidebar
- Pages with a nav entry: pull `title` / `description` from that item for `PageShell`
- Active state: exact match or `pathname.startsWith(`${href}/`)`

---

## design-tokens

# Design Tokens & Typography

Use semantic Tailwind tokens from `app/globals.css`. Do not hard-code colors.

- Colors: `background`, `foreground`, `card`, `muted`, `primary`, `border`, etc.
- Prefer `text-pretty` / `text-balance` on readable multi-line copy

---

## shadcn-ui

# shadcn-First UI

Build UI from `@/components/ui/*`. Compose with `cn()` from `@/lib/utils`.

- Prefer existing primitives over one-off styled elements
- Feature UI lives in `components/[feature]/`
- Don't invent parallel button/input/dialog systems
