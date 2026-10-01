# References for Crew print resume two-column layout

## Similar implementations

### CrewResumeDocument (print layout)

- **Location:** `components/crew/crew-resume-document.tsx`
- **Relevance:** Sole print-only resume markup; all layout changes live here
- **Key patterns:** `CrewResumeData` props, section titles via `crew-resume-section-title`, credits via `formatResumeCredit`

### buildCrewResumeData

- **Location:** `lib/crew/build-resume-data.ts`
- **Relevance:** Assembles person, bio, credits, details rows, profile URLs
- **Key patterns:** No schema change required; social links read in document via `getPersonSocialLinks`

### getPersonSocialLinks

- **Location:** `lib/social-links.ts`
- **Relevance:** Same link labels/display as live crew profile sidebar
- **Key patterns:** `SocialLinkDisplay` with `label`, `display`, `href`

### Public crew profiles spec

- **Location:** `agent-os/specs/2026-09-17-2008-public-crew-profiles/`
- **Relevance:** Original print resume task; smoke-check for print verification
- **Key patterns:** `crew-print.css`, `CrewAutoPrint`, `?print=resume`
