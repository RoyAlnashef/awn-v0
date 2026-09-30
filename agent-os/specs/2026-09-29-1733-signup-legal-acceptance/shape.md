# Signup Legal Acceptance — Shaping Notes

## Scope

Add step 4 to the Request Access and invite Apply wizards (after Social links). Users must check four separate boxes—Community Guidelines, Job Posting Guidelines, Terms of Service, and Privacy Policy—each with a linked title (opens marketing page in a new tab) and a short signup-specific summary. Submit application runs only on this step. After application submit and sign-in, persist all four acceptances via `acceptLegalDocuments` so the post-login `LegalAcceptanceGate` does not block pending users who already attested at signup.

## Decisions

- **Both flows:** Request Access and invite Apply share the same fourth step via `APPLY_STEPS`.
- **Step order:** Social links remain step 3; policies step is step 4 with Submit on the footer.
- **UI:** Four required checkboxes (Figma pattern), not the scroll-to-end gate dialog.
- **Summaries:** Custom one-line copy on the registry (`signupSummary`), not full document subtitles.
- **Links:** `/community-guidelines`, `/terms`, `/privacy`, `/job-posting-policy` in new tabs.
- **Persistence:** Client calls `acceptLegalDocuments` after successful `signInWithPassword`; reuses `legal_acceptances` and version strings from the registry.
- **Stepper fix:** Derive stepper items from the `steps` prop (was hardcoded to three items).

## Context

- **Visuals:** Request Access wizard (3-step reference) and Figma checkbox row pattern in `visuals/`.
- **References:** see `references.md`.
- **Product alignment:** Extends `06_Request_Access.txt` (terms/privacy mention on submit) and `07_Account_Acceptance.txt` (record acceptances per user/version). Job posting and community guidelines align with the four-document gate built in the prior spec.

## Standards Applied

`agent-os/standards/index.yml` is empty. Follow existing patterns: auth inside server actions, shared legal registry, shadcn Field + Checkbox, minimal new surface area.
