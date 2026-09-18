# References for Public Crew Profile Pages

## Similar Implementations

### Person profile card + resume download

- **Location:** `components/people/person-profile-card.tsx`
- **Relevance:** Primary in-app profile UI — section content, availability badge, tour credit cards, Profile/Resume button placement
- **Key patterns:** `getMemberResumeSignedUrl` for PDF download; social links via `getPersonSocialLinks`; disabled Profile button today — wire to public URL

### Account profile preview

- **Location:** `components/account/account-profile-preview.tsx`
- **Relevance:** Preview parity target for how profile sections render while editing
- **Key patterns:** Renders `PersonProfileCard` in `mode="preview"`; Profile button should open live public page when handle exists

### Profile data mappers

- **Location:** `lib/account/profile-data.ts`
- **Relevance:** Source of truth for profile field mapping and `Person` type
- **Key patterns:** `MEMBER_PROFILE_SELECT`, `toPersonFromProfile`, `toTourCreditsFromRows` — extend with `handle`

### Member data loader

- **Location:** `lib/people/actions.ts`
- **Relevance:** `getMemberById` fetch pattern for tour credits ordering; `getMemberResumeSignedUrl` for signed resume URLs
- **Key patterns:** Admin client for resume signed URLs; credit ordering and vouch counts

### Resume upload (owner)

- **Location:** `components/account/resume-section.tsx`, `lib/account/profile-actions.ts`
- **Relevance:** Same `profiles.resume_url` / `profiles.resume_filename` source for public download
- **Key patterns:** Private `resumes` bucket, 10-min signed URL TTL, revalidation on upload/remove

### Disabled "My Profile" button

- **Location:** `components/account/account-page-actions.tsx`
- **Relevance:** Primary account entry point — currently disabled with "Public profile page coming soon"
- **Key patterns:** Enable link to `getCrewProfilePath(handle)` with `target="_blank"`

### User dropdown navigation

- **Location:** `components/nav-user.tsx`
- **Relevance:** Add "My Profile" below "My Account" in header popover and mobile drawer
- **Key patterns:** Extend `NavUserData` with `handle`; use `ExternalLink` icon for external-facing public URL

### Auth middleware public prefixes

- **Location:** `lib/supabase/middleware.ts`
- **Relevance:** `/crew` must be accessible without authentication
- **Key patterns:** Add `"/crew"` to `PUBLIC_PREFIXES` alongside existing marketing routes

### Account resume sub-page spec

- **Location:** `agent-os/specs/2026-09-17-1946-account-resume-subpage/`
- **Relevance:** Documents resume bucket, profile columns, and owner upload/preview flow built immediately before this feature
- **Key patterns:** Signed URL preview, PDF-only constraint, `removeProfileResume` action

### Prior account profile spec

- **Location:** `agent-os/specs/2026-08-03-1827-account-profile-supabase/plan.md`
- **Relevance:** Notes public crew profile route (`/crew/[handle]`) as future work — this spec implements it

## Product Context

- **Location:** `agent-os/product/misc/feature-migration-inventory.md`
- **Relevance:** Defines "Public crew profile" persona story — shareable URL, bio, tour credits, availability badge, printable and SEO-friendly

- **Location:** `agent-os/product/roadmap.md`
- **Relevance:** Phase 2 includes SEO crew profiles at `/crew/[handle]`
