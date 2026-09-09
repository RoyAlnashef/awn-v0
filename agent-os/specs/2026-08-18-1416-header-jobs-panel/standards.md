# Standards for Header Jobs Panel

The following standards apply to this work.

---

## board-pattern

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

---

## shadcn-ui

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
