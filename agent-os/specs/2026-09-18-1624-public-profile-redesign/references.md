# References for Public Profile Page Redesign

## Similar Implementations

### Public crew profile page (current)

- **Location:** `components/crew/public-crew-profile-page.tsx`
- **Relevance:** Entry point for public layout; owns marketing chrome, resume print flow
- **Key patterns:** `LandingHeader`, apply CTA, `CrewResumeDocument`, `CrewAutoPrint`

### PersonProfileCard (public mode)

- **Location:** `components/people/person-profile-card.tsx`
- **Relevance:** Source of resume download logic, availability styling, section content
- **Key patterns:** `mode="public"`, read-only vouch display, `availabilityConfig`, social links

### Public data layer

- **Location:** `lib/crew/public-profile.ts`, `lib/crew/build-resume-data.ts`
- **Relevance:** Server-side profile fetch with field whitelist
- **Key patterns:** Admin client, handle normalization, tour credits mapping

### Landing / marketing chrome

- **Location:** `components/landing/landing-header.tsx`, `components/landing/landing-footer.tsx`, `components/landing/content.ts`
- **Relevance:** Header/footer and CTA copy for public pages
- **Key patterns:** Brand link, sign-in nav, request access CTA

### Resume download API

- **Location:** `app/api/crew/[handle]/resume/route.ts`
- **Relevance:** Signed PDF download when member has uploaded resume
- **Key patterns:** Public route, handle lookup, signed URL redirect

### Account preview (unchanged)

- **Location:** `components/account/account-profile-preview.tsx`
- **Relevance:** In-app preview continues using PersonProfileCard — not part of this redesign
- **Key patterns:** Preview mode, links to `/crew/{handle}` in new tab
