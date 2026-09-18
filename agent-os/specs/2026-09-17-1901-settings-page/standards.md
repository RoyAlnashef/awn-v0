# Standards for Settings Page

The following standards apply to this work.

---

## css/shadcn-ui

# shadcn-First UI

Build UI from `@/components/ui/*`. Compose with `cn()` from `@/lib/utils`.

```tsx
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

<Button className={cn("w-full", className)} />
```

- Prefer existing primitives over one-off styled elements
- Feature UI lives in `components/[feature]/` (e.g. `jobs/job-card.tsx`) — compose ui primitives, don't reimplement them
- Only add to `components/ui/` for reusable primitives shared across features (typically via shadcn CLI)
- Don't invent parallel button/input/dialog systems

---

## css/design-tokens

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

---

## global/page-shell

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

## global/sidebar-nav

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

## global/board-pattern

# Board + Card/Row Pattern

Browsable directories (jobs, people, and similar lists) use a `*Board` composition:

1. Filters bar (`*Filters`) with `onChange` / `onClear` / `activeCount`
2. Result count + grid/list view toggle
3. Grid of `*Card` **or** list of `*Row`
4. Dashed empty state when nothing matches

```
components/jobs/
  jobs-board.tsx      # owns filter state + view mode
  jobs-filters.tsx
  job-card.tsx
  job-row.tsx
```

- Default view: `grid` on land
- Board owns filter state; filters are controlled via props
- Empty state: dashed border, icon, short message, clear-filters action when filters are active
- Mirror this structure for new directory-style features
