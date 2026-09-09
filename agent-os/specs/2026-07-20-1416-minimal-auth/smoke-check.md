# Smoke checklist — Minimal Auth Slice

**No agent-run SQL.** Configure Auth in the Supabase Dashboard, then verify in the app.

## 1. Supabase Auth settings

1. **Authentication → URL configuration**
   - Site URL: `http://localhost:3000` (local) / your production origin
   - Redirect URLs must include:
     - `http://localhost:3000/auth/callback`
     - `http://localhost:3000/auth/callback?**` (if your project uses wildcard patterns)
     - Production equivalents when you deploy (including callback with `next=/login/reset-password`)
2. **Authentication → Providers → Email**
   - Enable Email
   - Confirm **Email password** sign-in is on
   - Confirm **Magic link** / OTP email is on

## 2. Test user (Owner)

Follow the existing profiles smoke steps if needed:

1. Create an auth user (Dashboard → Users) with email + password
2. Confirm a `profiles` row was created by the trigger
3. Promote to owner:

```sql
update public.profiles
set role = 'owner',
    status = 'active',
    full_name = coalesce(full_name, 'Owner')
where email = 'you@example.com';
```

## 3. App verification

1. Sign out / use a private window
2. Visit `/users` → redirected to `/login?next=%2Fusers`
3. **Password:** sign in → lands on `/users` (or `/now` from `/`); header shows your name (not Jordan Ellis)
4. **Magic link:** switch tab → send link → open email → `/auth/callback` → app
5. **Forgot password:** on password tab, click **Forgot password?** → `/login/forgot-password` → submit email → open Inbucket (local, port 54324) or your SMTP inbox → click reset link → `/login/reset-password` → set new password (8+ chars) → lands on `/now` with active session → sign out → sign in with new password
6. **Log out** (header menu) → `/login`; visiting `/now` redirects to login again

## Notes

- Invite-only: magic link uses `shouldCreateUser: false` — unknown emails will not get accounts
- Forgot password shows a generic success message (does not reveal whether the email exists)
- Approval gate is intentionally out of scope for this slice
