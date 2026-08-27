# Standards for Member Invites

The following standards apply to this work.

---

## global/page-shell

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

**Applies here:** People page gets Invite button in `actions`; Admin Invites and Applications pages replace placeholder shells.

---

## global/board-pattern

Browsable directories (jobs, people, and similar lists) use a `*Board` composition:

1. Filters bar (`*Filters`) with `onChange` / `onClear` / `activeCount`
2. Result count + grid/list view toggle
3. Grid of `*Card` **or** list of `*Row`
4. Dashed empty state when nothing matches

- Default view: `grid` on land
- Board owns filter state; filters are controlled via props
- Empty state: dashed border, icon, short message, clear-filters action when filters are active
- Mirror this structure for new directory-style features

**Applies here:** Admin Applications and Invites tables should follow filter + list + dashed empty state conventions where applicable.

---

## css/shadcn-ui

Build UI from `@/components/ui/*`. Compose with `cn()` from `@/lib/utils`.

- Prefer existing primitives over one-off styled elements
- Feature UI lives in `components/[feature]/` — compose ui primitives, don't reimplement them
- Only add to `components/ui/` for reusable primitives shared across features
- Don't invent parallel button/input/dialog systems

**Applies here:** Invite drawer, application review panel, deny dialog, and admin tables compose from existing Drawer, Dialog, Table, Button, and Form primitives.

---

## Server Action Conventions

Established pattern across `lib/users/actions.ts`, `lib/people/actions.ts`, `lib/messages/actions.ts`:

- `"use server"` + `createClient()` + session check
- Return `{ ok: true, ... } | { ok: false, error: string }` unions
- Use `revalidatePath` after mutations affecting page data
- Admin mutations call `requireAdmin()` from `lib/auth/require-admin.ts`
- Service-role operations (auth user creation, email send) via `createAdminClient()` only — never imported from client components

**Applies here:** All invite, application, and notification server actions follow this pattern.

---

## Migration Rule (Hard)

Agents create `.sql` migration files in `supabase/migrations/` only.

**Never** run migrations against Supabase (no CLI `db push`, no Dashboard API, no MCP SQL). Human pastes each file into the Supabase SQL Editor.
