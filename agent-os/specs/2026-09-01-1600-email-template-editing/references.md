# References for Email Template Editing

## Similar Implementations

### Admin Emails page (parent feature)

- **Location:** `app/(app)/email/templates/page.tsx`, `components/email/templates/templates-page-content.tsx`
- **Relevance:** Current list + preview split layout being extended
- **Key patterns:** `EmailLayoutShell`, `EmailPreviewProvider`, catalog-driven template list

### Broadcast server actions

- **Location:** `lib/email/broadcast-actions.ts`
- **Relevance:** Server action auth, error handling, admin client writes
- **Key patterns:** `requireAdmin()`, `ActionResult<T>`, `createAdminClient()`, `revalidatePath`

### Email template catalog

- **Location:** `lib/email/catalog.ts`, `lib/email/templates/`
- **Relevance:** Template registry, preview HTML, Supabase Go-tagged HTML
- **Key patterns:** `getTemplatePreviewHtml`, `renderSupabaseTemplate`, `substituteSupabaseTags`

### Messages master-detail

- **Location:** `components/messages/messages-view.tsx`
- **Relevance:** Left column list/detail visibility toggle inspiration
- **Key patterns:** Separate panels, mobile back navigation

### Apply form back button

- **Location:** `components/apply/apply-form-steps.tsx`
- **Relevance:** Form footer Back button with ChevronLeft
- **Key patterns:** Outline button, disabled during pending

### Broadcast page toasts

- **Location:** `components/email/broadcast/broadcast-page-content.tsx`
- **Relevance:** Success/error toast feedback on save/send
- **Key patterns:** `toast.success` / `toast.error` from sonner
