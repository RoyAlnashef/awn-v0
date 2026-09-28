# Standards for Check-in Component Polish

The following standards apply to this work.

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

**For this spec:** the self / "YOU" orange-ring marker and checked-in avatar ring must use a theme token or CSS variable, not a one-off hex.

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
- Feature UI lives in `components/[feature]/` (e.g. `now/check-in-form-popover.tsx`) — compose ui primitives, don't reimplement them
- Only add to `components/ui/` for reusable primitives shared across features (typically via shadcn CLI)
- Don't invent parallel button/input/dialog systems

**For this spec:** build the search bar from `InputGroup`, the forms from `Popover` + `Textarea`, and the header chip from `Avatar` + `Button`. For the Map/List view toggle, reuse the shared `BoardViewToggle` (`@/components/board-view-toggle`) — the same segmented button group Jobs and People use — rather than a bespoke `ToggleGroup`.

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

**For this spec:** `/now` stays inside `PageShell`; the check-in surface is page content, not custom page chrome.

---

## global/board-pattern

# Board + Card/Row Pattern

Browsable directories (jobs, people, and similar lists) use a `*Board` composition:

1. Filters bar (`*Filters`) with `onChange` / `onClear` / `activeCount`
2. Result count + grid/list view toggle
3. Grid of `*Card` **or** list of `*Row`
4. Dashed empty state when nothing matches

- Default view: `grid` on land
- Board owns filter state; filters are controlled via props
- Empty state: dashed border, icon, short message, clear-filters action when filters are active
- Mirror this structure for new directory-style features

**For this spec:** reuse `PersonCard` / `PersonProfileDrawer` from the People board for member popovers and list rows rather than inventing a parallel card. The Map/List toggle reuses the board's shared `BoardViewToggle` component (used by Jobs and People) rather than mirroring or re-implementing the idiom.

---

## Server Action auth (from vercel-react-best-practices)

Server Actions are public endpoints. Every action in `lib/now/actions.ts`
(`checkInAtLocation`, `checkInBySearch`, `clearCheckIn`) must keep the existing
`getSessionUser` auth guard and validate/trim/cap input (note <= 80 chars)
before mutating. Keep the Mapbox token server-side; never expose raw geocode
results to the client.
