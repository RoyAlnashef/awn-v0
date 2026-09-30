import {
  communityGuidelines,
  jobPostingPolicy,
  privacyPolicy,
  termsOfService,
  type LegalDocument,
} from "@/components/legal/content"

export type LegalDocumentKey =
  | "community-guidelines"
  | "terms"
  | "privacy"
  | "job-posting-policy"

export type LegalDocumentEntry = {
  key: LegalDocumentKey
  document: LegalDocument
  version: string
  /** Marketing route for the full document (signup links open in a new tab). */
  href: string
  /** One-line copy for signup / lightweight acceptance UIs. */
  signupSummary: string
}

/**
 * Ordered registry of the legal/conduct documents that require acceptance.
 * Shared by the server reader/action and the client gate so keys, versions,
 * and tab order stay in one place. `version` is the document's `lastUpdated`
 * string; bumping it re-prompts members for that document.
 *
 * Order matters: Community Guidelines is the default/first tab (priority).
 */
export const LEGAL_DOCUMENTS: LegalDocumentEntry[] = [
  {
    key: "community-guidelines",
    document: communityGuidelines,
    version: communityGuidelines.lastUpdated,
    href: "/community-guidelines",
    signupSummary: "Professional conduct and respect on AWN.",
  },
  {
    key: "terms",
    document: termsOfService,
    version: termsOfService.lastUpdated,
    href: "/terms",
    signupSummary: "Rules for your account and using AWN.",
  },
  {
    key: "privacy",
    document: privacyPolicy,
    version: privacyPolicy.lastUpdated,
    href: "/privacy",
    signupSummary: "How we collect and use your information.",
  },
  {
    key: "job-posting-policy",
    document: jobPostingPolicy,
    version: jobPostingPolicy.lastUpdated,
    href: "/job-posting-policy",
    signupSummary: "Accurate, legitimate job posts only.",
  },
]

/** Default unchecked state for signup checkbox UI. */
export function createLegalAcceptanceState(
  accepted = false,
): Record<LegalDocumentKey, boolean> {
  return Object.fromEntries(
    LEGAL_DOCUMENTS.map((entry) => [entry.key, accepted]),
  ) as Record<LegalDocumentKey, boolean>
}

const LEGAL_DOCUMENTS_BY_KEY = new Map<LegalDocumentKey, LegalDocumentEntry>(
  LEGAL_DOCUMENTS.map((entry) => [entry.key, entry]),
)

export function getLegalDocument(
  key: LegalDocumentKey,
): LegalDocumentEntry | undefined {
  return LEGAL_DOCUMENTS_BY_KEY.get(key)
}
