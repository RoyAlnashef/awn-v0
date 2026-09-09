# Standards for My Jobs Management Pages

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

```ts
export type NavItem = {
  title: string
  href: string
  description: string
  icon: LucideIcon
  badge?: string
  live?: boolean
}
```

- Add primary app routes to `mainNav` or `adminNav` when they belong in the sidebar
- Deep-link-only routes (drawers, detail URLs) may omit sidebar entries
- Pages with a nav entry: pull `title` / `description` from that item for `PageShell`
- Active state: exact match or `pathname.startsWith(`${href}/`)`
- Use `SidebarMenuButton` with `render={<Link href={…} />}` for navigation

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
