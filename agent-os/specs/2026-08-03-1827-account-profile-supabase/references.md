# References for Account Profile — Supabase Wiring

## Similar Implementations

### avatar-actions.ts

- **Location:** `lib/users/avatar-actions.ts`
- **Relevance:** Storage upload + profile column update pattern for avatars
- **Key patterns:** Admin client, MIME/size validation, revalidatePath, result types

### avatar-upload-field.tsx

- **Location:** `components/users/avatar-upload-field.tsx`
- **Relevance:** Immediate upload + toast + router.refresh() on settings page
- **Key patterns:** FormData, pending state, error handling

### get-session-user.ts

- **Location:** `lib/auth/get-session-user.ts`
- **Relevance:** Server-side profile fetch with React.cache
- **Key patterns:** Join auth user + profile row

### require-profile-editor.ts

- **Location:** `lib/auth/require-profile-editor.ts`
- **Relevance:** Self-or-admin auth gate for profile mutations
- **Key patterns:** AuthError, isAdmin check

### AccountProfileProvider

- **Location:** `components/account/account-profile-provider.tsx`
- **Relevance:** Draft state + live preview; extended with saved snapshot
- **Key patterns:** updateDraft, commitSaved, resetDraft

### admin-users-profiles smoke-check

- **Location:** `agent-os/specs/2026-07-20-1356-admin-users-profiles/smoke-check.md`
- **Relevance:** Migration apply + manual verification format
