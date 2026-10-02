# Sidebar Navigation

Define sidebar items in `lib/nav.ts` (`mainNav` / `adminNav`). Don’t hard-code nav arrays in the sidebar.

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
