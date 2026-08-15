# Standards for People Directory — Supabase Wiring

The following standards apply to this work.

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

---

## global/page-shell

Every authenticated app page wraps content in `PageShell`.

- Use `title`, optional `description`, optional `actions`, and `children`
- Pull title/description from `lib/nav` when the page has a nav entry
- No parallel page headers or custom chrome

---

## Server Action Conventions

- `"use server"` + `createClient()` + session check
- Return `{ ok: true, ... } | { ok: false, error: string }` unions
- Use `revalidatePath` after mutations affecting directory data
