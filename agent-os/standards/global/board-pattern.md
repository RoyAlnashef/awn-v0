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
