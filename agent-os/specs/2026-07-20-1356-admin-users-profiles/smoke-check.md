# Smoke checklist — Admin Users + Profiles

**Agents never run these SQL statements.** Paste and run them yourself in the Supabase Dashboard → SQL Editor.

## 1. Apply migration

1. Open [`supabase/migrations/20260720140000_create_profiles.sql`](../../../supabase/migrations/20260720140000_create_profiles.sql)
2. Copy the **entire** file
3. Paste into Supabase → SQL Editor → Run
4. Confirm `public.profiles` exists under Table Editor

## 2. Create a test auth user

1. Supabase → Authentication → Users → Add user
2. Create with email/password (or magic link) using an email you control
3. Confirm a matching row appears in `public.profiles` (trigger)

## 3. Promote to Owner

Run in SQL Editor (replace the email):

```sql
update public.profiles
set role = 'owner',
    status = 'active',
    full_name = coalesce(full_name, 'Owner')
where email = 'you@example.com';
```

## 4. Env + app

1. Ensure `.env.local` has `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`
2. Sign in with that owner account (auth UI may still be unfinished — use whatever session path you have, or temporary dashboard testing)
3. Open `/users`

## 5. Verify CRUD

- [ ] Table lists profiles (not mock people)
- [ ] Search + role/status filters work
- [ ] **Add user** creates account with password; row appears as Active; user can sign in at `/login`
- [ ] **Edit role** updates the badge
- [ ] **Suspend / Reactivate** update status
- [ ] **Delete** removes the user (confirm dialog)
- [ ] Bulk select → set role / suspend / reactivate / delete
- [ ] View profile and 2FA menu items show “coming soon” toasts only

## Notes

- Until auth UI exists, `/users` shows an error banner if there is no Owner/Admin session
- Invite and delete use the service-role client server-side only
- Do not run `supabase db push` or any automated migration apply from agents
