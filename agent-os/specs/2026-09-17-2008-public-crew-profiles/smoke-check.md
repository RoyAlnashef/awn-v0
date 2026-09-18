# Smoke checklist — Public Crew Profiles

**Agents never run these SQL statements.** Paste and run them yourself in the Supabase Dashboard → SQL Editor.

## 1. Apply migration

1. Open [`supabase/migrations/20260917200000_add_profile_handle.sql`](../../../supabase/migrations/20260917200000_add_profile_handle.sql)
2. Copy the **entire** file → Supabase → SQL Editor → Run
3. Confirm `handle` column exists on `public.profiles` and existing members have handles backfilled

```sql
-- Optional: verify your test user's handle
select id, full_name, handle, status from public.profiles where email = 'your-test@email.com';
```

## 2. Prerequisites

- [ ] `.env.local` has Supabase env vars (`NEXT_PUBLIC_SUPABASE_URL`, keys, admin key for signed resume URLs)
- [ ] Dev server running (`pnpm dev`)
- [ ] Test member account with an **active** profile and at least one tour credit
- [ ] Note your handle from SQL or **Account → Profile → Public profile** section (e.g. `roy-alnashef`)

---

## 3. Public page (logged out)

Open an incognito/private window (or sign out).

- [ ] Visit `/crew/{your-handle}` — page loads (no redirect to login)
- [ ] Person Card layout renders: banner/avatar, name, role · location, availability badge
- [ ] Skills tags, bio, tour credits (read-only vouch counts), social links (if set) appear
- [ ] No Message/Connect/Share/Report footer (public mode)
- [ ] Apply CTA below card links to `/request-access`
- [ ] Landing header and footer visible
- [ ] View page source or devtools → `<title>` is `{Name} | AWN` with a meta description
- [ ] Visit `/crew/nonexistent-handle-xyz` → 404 page

---

## 4. Resume — uploaded PDF

Use a member who has a resume on **Account → Resume**.

Logged out on `/crew/{handle}`:

- [ ] **Resume** button in sticky header downloads/opens a PDF (not print dialog)
- [ ] PDF is the uploaded file (not the generated layout)

Logged in on in-app profile card (People drawer):

- [ ] **Resume** button downloads the same PDF via signed URL

---

## 5. Resume — no upload (Save as PDF)

Use a member **without** a resume, or temporarily remove yours on Account → Resume.

Logged out on `/crew/{handle}`:

- [ ] Button reads **Save as PDF** (header + floating bottom-right)
- [ ] Clicking opens the browser **Print** dialog
- [ ] Print preview shows the two-column white resume (not the dark profile page)
- [ ] Preview includes: header, skills, bio, competencies, tour credits, links, work auth, experience (when data exists)
- [ ] Turn off **Headers and footers** in print dialog → clean PDF without browser URL/date stamps
- [ ] Footer shows profile URL + "A Wright Network — By Invitation Only"

Direct print URL:

- [ ] `/crew/{handle}?print=resume` auto-opens print dialog in a new tab

---

## 6. Profile link entry points (logged in)

All should open `/crew/{handle}` in a **new tab**.

**My Account**

- [ ] **My Profile** button (top actions) opens your public page

**User dropdown** (header + mobile drawer)

- [ ] **My Profile** appears directly below **My Account**
- [ ] Opens your public page in a new tab

**Account preview card** (desktop right panel)

- [ ] **Profile** button is **enabled** (not "Preview only" disabled)
- [ ] Opens your live public page (saved DB state, not unsaved draft edits)

**People directory / in-app drawer**

- [ ] Open another member's profile card → **Profile** opens their `/crew/{handle}`
- [ ] **Resume** on their card: download if they have a file; otherwise opens print URL in new tab

---

## 7. Account — public profile URL

On **Account → Profile**:

- [ ] **Public profile** section shows `/crew/{handle}`
- [ ] **Copy** copies full URL to clipboard (toast confirms)
- [ ] **View** opens public page in new tab

---

## 8. Handle generation edge cases

- [ ] New or handle-less member (if testable): visiting Account → Profile triggers handle creation
- [ ] After save, **My Profile** and dropdown link appear (may require refresh)

---

## 9. Revalidation after edits

On your public page, note current bio or a tour credit.

- [ ] Edit bio or tour credits on Account → save
- [ ] Hard refresh `/crew/{handle}` (logged out) → changes appear
- [ ] Upload or remove resume on Account → Resume → public **Resume** / **Save as PDF** behavior updates accordingly

---

## 10. Regression

- [ ] `/account/profile`, `/account/resume`, `/people` still work when logged in
- [ ] Marketing home `/` still accessible logged out
- [ ] Logged-in app routes still require auth (e.g. `/now` redirects to login when signed out)
- [ ] In-app profile card connect/message/vouch actions still work (interactive mode)

---

## Notes

- Public page shows **saved database state**, not unsaved draft edits on Account
- Handle editing UI is deferred — handles are auto-generated from name for v1
- Privacy settings ("Who can view your resume") are not enforced yet; public resume download is open when a file exists
