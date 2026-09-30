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
  },
  {
    key: "terms",
    document: termsOfService,
    version: termsOfService.lastUpdated,
  },
  {
    key: "privacy",
    document: privacyPolicy,
    version: privacyPolicy.lastUpdated,
  },
  {
    key: "job-posting-policy",
    document: jobPostingPolicy,
    version: jobPostingPolicy.lastUpdated,
  },
]

const LEGAL_DOCUMENTS_BY_KEY = new Map<LegalDocumentKey, LegalDocumentEntry>(
  LEGAL_DOCUMENTS.map((entry) => [entry.key, entry]),
)

export function getLegalDocument(
  key: LegalDocumentKey,
): LegalDocumentEntry | undefined {
  return LEGAL_DOCUMENTS_BY_KEY.get(key)
}
