# Smoke checklist — Account Profile Supabase Wiring

**Agents never run these SQL statements.** Paste and run them yourself in the Supabase Dashboard → SQL Editor.

## 1. Apply migrations

1. Open [`supabase/migrations/20260803190000_extend_profiles_member_fields.sql`](../../../supabase/migrations/20260803190000_extend_profiles_member_fields.sql)
2. Copy the **entire** file → Supabase → SQL Editor → Run
3. Open [`supabase/migrations/20260803191000_create_banners_bucket.sql`](../../../supabase/migrations/20260803191000_create_banners_bucket.sql)
4. Copy the **entire** file → SQL Editor → Run
5. Confirm new columns on `public.profiles` and `banners` bucket under Storage

## 2. Sign in

1. Ensure `.env.local` has Supabase env vars
2. Sign in as a test user with an active profile row
3. Open `/account/profile`

## 3. Load

- [ ] Form shows your real name/title from DB (not Jordan Reyes mock)
- [ ] Empty fields show sensible defaults, not placeholder mock data

## 4. Edit basic info

- [ ] Change name, bio, company → **Save changes**
- [ ] Toast confirms success
- [ ] Refresh page → values persist
- [ ] Preview panel updates live while editing

## 5. Cancel

- [ ] Edit fields without saving → **Cancel**
- [ ] Form reverts to last saved values

## 6. Avatar

- [ ] Upload and crop profile photo → persists after refresh
- [ ] Preview updates live during upload
- [ ] Remove photo → persists after refresh

## 7. Banner

- [ ] Upload banner → persists after refresh
- [ ] Drag to reposition → position persists after refresh
- [ ] Replace and remove → persists after refresh

## 8. Availability / tiers / auth / skills

- [ ] Edit availability, dates, venue tiers, work auth, skills → Save → refresh → persist
- [ ] Preview badges match saved values

## 9. Preview UX

- [ ] Desktop right panel preview unchanged
- [ ] Mobile "Profile Card" drawer works
- [ ] Tour credits in preview still show mock data

## 10. Regression

- [ ] `/settings` avatar upload still works
- [ ] Admin `/users` table unaffected

## Notes

- `is_verified` and `is_founding_member` are admin-set; test via SQL if needed
- Do not run `supabase db push` or any automated migration apply from agents
