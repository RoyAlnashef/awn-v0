# References for Admin Users + Profiles

## Similar Implementations

### Admin Users table (UI shell)

- **Location:** `components/users/users-table.tsx`
- **Relevance:** Existing search, filters, selection, row actions, invite CTA — wire to live data
- **Key patterns:** Client-side filter state; checkbox bulk select; role/status badge configs from `lib/users-data.ts`

### Users mock data model

- **Location:** `lib/users-data.ts`
- **Relevance:** Canonical RBAC roles, statuses, badge styling; replace mock `adminUsers` for the page
- **Key patterns:** `UserRole`, `UserStatus`, `roleConfig`, `statusConfig`, `AdminUser` shape

### Supabase clients

- **Location:** `lib/supabase/server.ts`, `lib/supabase/admin.ts`, `lib/supabase/client.ts`
- **Relevance:** Session-aware reads/guards; service-role invite/delete
- **Key patterns:** `createClient()` for cookies/session; `createAdminClient()` never imported from client components

### Users page shell

- **Location:** `app/(app)/users/page.tsx`
- **Relevance:** RSC entry — load profiles server-side, pass into table
- **Key patterns:** `PageShell` + nav item title/description

### Invite dialog pattern

- **Location:** `components/jobs/post-job-dialog.tsx`
- **Relevance:** Dialog + form layout conventions for Invite user
- **Key patterns:** Controlled open state; FieldLabel uppercase styling; Dialog primitives from shadcn
