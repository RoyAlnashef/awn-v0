# Standards — Employer Role & My Jobs Tabs

## Applicable Patterns from the Codebase

### 1. Role-based access: server-side guard + prop threading

Always check roles on the **server** (page or API route), never rely solely on client-side hiding.

- Server pages: call `getSessionUser()`, derive the boolean (`canPostJobs`), redirect or return 403 if the role requirement isn't met.
- Client components: receive the boolean as a prop from the nearest server ancestor — never re-fetch the session on the client.

```typescript
// Server page / layout pattern
const sessionUser = await getSessionUser()
if (!sessionUser?.canPostJobs) redirect("/my-jobs/saved")
```

### 2. API route authentication

All mutating API routes must call `requireApiUser()` and check the derived role flag before any DB work.

```typescript
const user = await requireApiUser()         // 401 if unauthenticated
if (!user.canPostJobs) {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 })
}
```

### 3. React.cache() for per-request deduplication

`getSessionUser()` is already wrapped in `React.cache()`. Any new helper that reads session data (e.g. a future `requireEmployer()`) should follow the same pattern so multiple calls within one request share the result.

### 4. SWR for client-side data fetching

New client sections (e.g. `SavedJobsSection`) use `useSWR` with a stable key from `lib/jobs/swr-keys.ts`. Do not add ad-hoc `fetch` calls inside components.

```typescript
const { data, error, isLoading } = useSWR(savedJobsKey, () => fetchMyJobs("saved"))
```

### 5. Functional setState / stable callbacks

Any new client components that manage state follow the functional-update pattern (`setItems(curr => [...curr])`) to avoid stale closures.

### 6. Explicit conditional rendering

Use `condition ? <Component /> : null` rather than `condition && <Component />` when the condition could be `0` or other falsy non-boolean values (e.g. array lengths).
