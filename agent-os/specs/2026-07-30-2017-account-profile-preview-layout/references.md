# References for Account Profile Preview Layout

## Similar Implementations

### PersonProfileDrawer

- **Location:** `components/people/person-profile-drawer.tsx`
- **Relevance:** Source UI for the contact card; card body extracted into PersonProfileCard
- **Key patterns:** Hero overlap, meta chips, tour credits list, footer action bar

### Account Layout (before)

- **Location:** `app/(app)/account/layout.tsx`
- **Relevance:** 2-column sidebar grid replaced with 8/4 layout
- **Key patterns:** PageShell + AccountNav + bordered content card

### AccountNav

- **Location:** `components/account/account-nav.tsx`
- **Relevance:** Vertical nav converted to horizontal underline tabs on desktop
- **Key patterns:** Route-based active state via usePathname()

### shadcn Tabs (line variant)

- **Location:** `components/ui/tabs.tsx`
- **Relevance:** Underline active indicator pattern for horizontal nav styling
- **Key patterns:** `after:` pseudo-element on active tab trigger

### people-data

- **Location:** `lib/people-data.ts`
- **Relevance:** Person, TourCredit, getPersonProfile() types and seed data
- **Key patterns:** Person type with optional extended fields; getPersonProfile() enrichment
