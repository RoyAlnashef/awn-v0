# References for Job Detail Drawer

## Similar Implementations

### PersonProfileDrawer

- **Location:** `components/people/person-profile-drawer.tsx`
- **Relevance:** Primary layout reference — right-side Sheet, hero + ScrollArea + fixed footer
- **Key patterns:** `SheetContent` floating panel styling, `initialFocus` on hero, sr-only title/description, section labels, footer action rows

### PersonCard trigger pattern

- **Location:** `components/people/person-card.tsx`
- **Relevance:** Stretched button opens drawer; action buttons at `z-10`
- **Key patterns:** `absolute inset-0 z-0` button, `relative z-10` on interactive controls

### Jobs board

- **Location:** `components/jobs/jobs-board.tsx`, `job-card.tsx`, `job-row.tsx`
- **Relevance:** Integration targets for drawer wiring
- **Key patterns:** SWR list fetch, save/apply actions, `ApplyJobDialog`

### Jobs API

- **Location:** `app/api/jobs/[id]/route.ts`, `lib/jobs/fetch.ts`, `lib/jobs/map.ts`
- **Relevance:** Single-job fetch with applicant count and poster id
- **Key patterns:** `mapJobPostingRow`, `requireApiUser`, parallel Supabase queries
