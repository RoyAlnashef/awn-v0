# References for Now Page First-Login Onboarding

## Similar Implementations

### Now page (current placeholder)

- **Location:** `app/(app)/now/page.tsx`
- **Relevance:** Entry point to replace with onboarding UI
- **Key patterns:** `PageShell` with hard-coded greeting, Refresh/Broadcast actions, empty children

### PageShell

- **Location:** `components/page-shell.tsx`
- **Relevance:** Standard authenticated page chrome; title, description, actions slot
- **Key patterns:** Used by all `app/(app)/` routes; NowView will render PageShell from client to host layout toggle in `actions`

### ButtonGroup

- **Location:** `components/ui/button-group.tsx`
- **Relevance:** Header layout toggle (Two-column / Three-column)
- **Key patterns:** Horizontal segmented control; compose with `Button` children

### Help Now dialog

- **Location:** `components/help-now/help-now-dialog.tsx`, `components/help-now/help-now-form.tsx`
- **Relevance:** Getting started checklist step 3 ("Post a Help Now request"); mobile Help Now banner
- **Key patterns:** Dialog wrapper around shared form; existing header entry point

### Groups / rooms

- **Location:** `app/(app)/groups/page.tsx`, `components/groups/rooms-view.tsx`
- **Relevance:** "Choose your groups" maps to discipline community rooms
- **Key patterns:** Groups nav item; rooms organized by discipline (Musicians, Audio, Lighting & Video)

### Mock data pattern

- **Location:** `lib/people-data.ts`, `lib/jobs/*`
- **Relevance:** Template for `lib/now/now-data.ts` static fixtures
- **Key patterns:** Exported typed arrays/constants; no fetch in design-first pass

### Nav metadata

- **Location:** `lib/nav.ts`
- **Relevance:** Now tab description for PageShell
- **Key patterns:** `mainNav.find(item => item.href === "/now")`

### Help Now form spec (prior art)

- **Location:** `agent-os/specs/2026-08-30-1402-help-now-form/`
- **Relevance:** Help Now dialog UX already shipped; reuse for checklist integration
- **Key patterns:** Reusable form component, 48h urgent posts

### Private groups spec

- **Location:** `agent-os/specs/2026-09-20-1648-private-groups/`
- **Relevance:** Groups/rooms data model context for future backend wiring
- **Key patterns:** Community rooms, join flows (deferred for this pass)

## Product Context

- **Location:** `agent-os/product/roadmap.md`, `agent-os/product/misc/feature-migration-inventory.md`
- **Relevance:** Now tab is Phase 1 MVP — availability, Help Now, check-in map
- **Key patterns:** Current `/now` is placeholder; this spec delivers first-login onboarding shell
