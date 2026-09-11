# Standards — Resume in Job Applications

## File Upload Pattern

All file uploads in this codebase use `createAdminClient()` from `@/lib/supabase/admin` to bypass RLS — matching the pattern in `lib/applications/actions.ts` and `lib/account/profile-actions.ts`.

Validation before upload:
```typescript
if (!ALLOWED_TYPES.has(file.type)) throw new Error("Must be a PDF.")
if (file.size > MAX_BYTES) throw new Error("Must be 5 MB or smaller.")
```

Upload with upsert:
```typescript
await admin.storage.from(BUCKET).upload(path, buffer, {
  contentType: "application/pdf",
  upsert: true,
})
```

## Server Action Authentication

Every `"use server"` action must verify the session before operating:
```typescript
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) return { ok: false, error: "Not authenticated." }
```

## Signed URL Generation

Private bucket objects are served via signed URLs only. Use admin client for generation:
```typescript
const { data, error } = await admin.storage
  .from(BUCKET)
  .createSignedUrl(path, 60 * 10) // 10 min
```

Never store or return raw storage URLs for private buckets.

## Error Return Shape

All server actions return a discriminated union:
```typescript
type ActionResult<T> = { ok: true } & T | { ok: false; error: string }
```

## API Route Auth

API routes use `requireApiUser()` from `@/lib/jobs/api-auth`:
```typescript
const { supabase, user, error } = await requireApiUser()
if (!user) return jsonError(error, 401)
```

Authorization (poster-only checks) always query the DB explicitly — never rely on middleware alone.
