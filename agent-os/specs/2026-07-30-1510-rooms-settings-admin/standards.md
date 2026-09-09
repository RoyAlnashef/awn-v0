# Standards for Rooms Settings Admin

The following standards apply to this work.

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
