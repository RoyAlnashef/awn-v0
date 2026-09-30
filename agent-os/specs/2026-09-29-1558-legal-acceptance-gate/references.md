# References for Legal Acceptance Gate

## Similar Implementations

### Per-user profile flag + server action (onboarding dismiss)

- **Location:** `supabase/migrations/20260923152800_add_onboarding_dismissed_at.sql`, `lib/onboarding/actions.ts`, `lib/onboarding/progress.ts`
- **Relevance:** Template for the migration pattern, the `React.cache` server reader running Supabase queries under RLS, and the `"use server"` action that auth-checks inside and `revalidatePath`s.
- **Key patterns:** `getOnboardingSignals()` (cached parallel reads) -> `getOutstandingLegalDocuments()`; `dismissOnboarding()` (auth-checked update) -> `acceptLegalDocuments()` (auth-checked upsert).

### Session / profile access

- **Location:** `lib/auth/get-session-user.ts`
- **Relevance:** `getSessionUser()` provides the current user id used to scope reads/writes.

### Legal content + view

- **Location:** `components/legal/content.ts`, `components/legal/legal-document.tsx`
- **Relevance:** Structured `LegalDocument` data (with `lastUpdated`) and the `LegalDocumentView` renderer reused inside each dialog tab.

### UI primitives (base-ui)

- **Location:** `components/ui/dialog.tsx`, `components/ui/tabs.tsx`, `components/ui/scroll-area.tsx`, `components/ui/button.tsx`
- **Relevance:** Dialog (`showCloseButton`, base-ui `modal` + `disablePointerDismissal`), Tabs, Button. Scroll-to-bottom uses a native `overflow-y-auto` container + IntersectionObserver sentinel (base-ui `ScrollArea` viewport does not expose a ref).

### App layout mount point

- **Location:** `app/(app)/layout.tsx`
- **Relevance:** Server component where session/approval gating already lives; the acceptance gate mounts here.

### Supabase clients

- **Location:** `lib/supabase/server.ts`
- **Relevance:** Cookie-based `createClient()` used by the server reader and action under RLS.
