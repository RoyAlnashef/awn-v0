"use server"

import { revalidatePath } from "next/cache"

import { getSessionUser } from "@/lib/auth/get-session-user"
import { getLegalDocument, type LegalDocumentKey } from "@/lib/legal/documents"
import { createClient } from "@/lib/supabase/server"

export type AcceptLegalResult = { ok: true } | { ok: false; error: string }

/**
 * Persists the current member's acceptance of one or more legal/conduct
 * documents. The accepted version is resolved server-side from the registry
 * (never trusted from the client), and rows are upserted per
 * (profile_id, document_key) so re-acceptance updates the stored version.
 */
export async function acceptLegalDocuments(
  keys: LegalDocumentKey[],
): Promise<AcceptLegalResult> {
  const user = await getSessionUser()
  if (!user) return { ok: false, error: "You must be signed in." }

  const uniqueKeys = Array.from(new Set(keys))
  if (uniqueKeys.length === 0) {
    return { ok: false, error: "No documents to accept." }
  }

  const acceptedAt = new Date().toISOString()
  const rows: {
    profile_id: string
    document_key: LegalDocumentKey
    version: string
    accepted_at: string
  }[] = []

  for (const key of uniqueKeys) {
    const entry = getLegalDocument(key)
    if (!entry) return { ok: false, error: "Unknown document." }
    rows.push({
      profile_id: user.id,
      document_key: entry.key,
      version: entry.version,
      accepted_at: acceptedAt,
    })
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from("legal_acceptances")
    .upsert(rows, { onConflict: "profile_id,document_key" })

  if (error) {
    return { ok: false, error: "Could not save. Please try again." }
  }

  revalidatePath("/", "layout")
  return { ok: true }
}
