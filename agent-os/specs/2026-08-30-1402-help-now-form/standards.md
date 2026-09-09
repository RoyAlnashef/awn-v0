# Standards for Help Now Form

The following standards apply to this work.

---

## shadcn-ui

# shadcn-First UI

Build UI from `@/components/ui/*`. Compose with `cn()` from `@/lib/utils`.

- Prefer existing primitives over one-off styled elements
- Feature UI lives in `components/[feature]/` — compose ui primitives
- Don't invent parallel button/input/dialog systems

---

## Jobs API conventions

- REST under `app/api/jobs/`; POST creates, PATCH updates
- Urgent posts: `kind: "urgent"`, `expires_at` set server-side (48h)
- Client revalidation via SWR mutate on `jobsListKey` and `urgentJobsKey`

---

## design-tokens

- Urgent styling via existing tokens: `urgentApplyButtonStyles`, `urgentBadgeStyles`, `urgentAccentTextStyles` in `lib/jobs/format.ts`
- Dialog title uses `font-heading` per design-tokens standard
