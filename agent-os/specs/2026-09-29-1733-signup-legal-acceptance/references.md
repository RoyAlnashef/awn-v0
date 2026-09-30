# References for Signup Legal Acceptance

## Legal infrastructure (reuse)

### Document registry

- **Location:** `lib/legal/documents.ts`
- **Relevance:** `LEGAL_DOCUMENTS`, keys, versions; extended with `href` and `signupSummary` for signup UI.

### Accept action

- **Location:** `lib/legal/actions.ts`
- **Relevance:** `acceptLegalDocuments(keys)` called after sign-in on application submit.

### Post-login gate (different UX)

- **Location:** `components/legal/legal-acceptance-gate.tsx`, `app/(app)/layout.tsx`
- **Relevance:** Same persistence; signup checkboxes satisfy outstanding docs for current versions.

### Prior spec

- **Location:** `agent-os/specs/2026-09-29-1558-legal-acceptance-gate/`
- **Relevance:** Data model and gate behavior; signup step complements rather than replaces the gate.

## Apply wizard

### Steps shell

- **Location:** `components/apply/apply-form-steps.tsx`
- **Relevance:** Step definitions, stepper, Back/Continue/Submit footer.

### Form state machine

- **Location:** `components/apply/apply-form.tsx`
- **Relevance:** Step transitions, submit, sign-in, redirect to `/pending`.

## UI

### Field + Checkbox

- **Location:** `components/ui/field.tsx`, `components/ui/checkbox.tsx`
- **Relevance:** Horizontal checkbox rows with title + description.

### Marketing legal pages

- **Location:** `app/(marketing)/community-guidelines/page.tsx`, `terms`, `privacy`, `job-posting-policy`
- **Relevance:** Link targets for document titles.
