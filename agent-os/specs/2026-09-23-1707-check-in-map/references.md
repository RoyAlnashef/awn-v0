# References for Check-in Map Wiring

## Similar Implementations

### Who's Around map UI

- **Location:** `components/now/whos-around-card.tsx`, `components/now/now-map.tsx`
- **Relevance:** Existing Mapbox map, overlays, Check in here CTA, nearby list
- **Key patterns:** Dynamic import with `ssr: false`, striped CSS fallback when token missing

### People board card

- **Location:** `components/people/person-card.tsx`, `components/people/person-profile-drawer.tsx`
- **Relevance:** Same small card + drawer on avatar click
- **Key patterns:** `PersonCard` opens `PersonProfileDrawer`; reuse for map popover

### People directory mapping

- **Location:** `lib/people/actions.ts`, `lib/account/profile-data.ts` (`toPersonFromProfile`, `MEMBER_PROFILE_SELECT`)
- **Relevance:** Map check-in rows to `Person` for cards/drawer
- **Key patterns:** `fetchDirectoryExtras` for connection status; `listDirectoryMembers` query shape

### Onboarding server actions

- **Location:** `lib/onboarding/actions.ts`
- **Relevance:** Auth-checked server actions + `revalidatePath("/now")`
- **Key patterns:** `"use server"`, `getSessionUser()`, cookie client under RLS
