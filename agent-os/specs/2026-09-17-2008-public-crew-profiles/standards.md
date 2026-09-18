# Standards for Public Crew Profile Pages

No formal standards apply to this work.

`agent-os/standards/index.yml` is empty — there are no indexed standards to include.

Follow existing project conventions:

- Marketing routes live under `app/(marketing)/` with public middleware prefixes
- Server-side data fetching uses admin client only where RLS blocks public reads, with strict field whitelisting
- UI components compose from `@/components/ui/*` and semantic design tokens
- Server actions authenticate and revalidate affected paths on profile/resume mutations
