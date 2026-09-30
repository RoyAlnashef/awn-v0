import { cache } from "react"

import { getSessionUser } from "@/lib/auth/get-session-user"
import {
  LEGAL_DOCUMENTS,
  type LegalDocumentEntry,
  type LegalDocumentKey,
} from "@/lib/legal/documents"
import { createClient } from "@/lib/supabase/server"

/** Flip to `true` to show the blocking legal acceptance gate in the app layout. */
export const LEGAL_ACCEPTANCE_GATE_ENABLED = false

/**
 * Returns the legal/conduct documents the current member still needs to accept
 * (never accepted, or accepted at an older version). Returns [] when everything
 * is current, which hides the acceptance gate. Cached per request.
 */
export const getOutstandingLegalDocuments = cache(
  async (): Promise<LegalDocumentEntry[]> => {
    if (!LEGAL_ACCEPTANCE_GATE_ENABLED) return []

    const user = await getSessionUser()
    if (!user) return []

    const supabase = await createClient()
    const { data } = await supabase
      .from("legal_acceptances")
      .select("document_key, version")
      .eq("profile_id", user.id)

    const acceptedVersionByKey = new Map<LegalDocumentKey, string>()
    for (const row of data ?? []) {
      acceptedVersionByKey.set(
        row.document_key as LegalDocumentKey,
        row.version as string,
      )
    }

    return LEGAL_DOCUMENTS.filter(
      (entry) => acceptedVersionByKey.get(entry.key) !== entry.version,
    )
  },
)
