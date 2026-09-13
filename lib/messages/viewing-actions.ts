"use server"

import { isUuid } from "@/lib/messages/format"
import { createClient } from "@/lib/supabase/server"

export type SetViewingConversationResult = { ok: true } | { ok: false; error: string }

export async function setViewingConversation(
  conversationId: string | null,
): Promise<SetViewingConversationResult> {
  try {
    if (conversationId !== null && !isUuid(conversationId)) {
      return { ok: true }
    }

    const supabase = await createClient()
    const { error } = await supabase.rpc("set_viewing_conversation", {
      p_conversation_id: conversationId,
    })

    if (error) {
      return { ok: false, error: error.message }
    }

    return { ok: true }
  } catch (error) {
    if (error instanceof Error) {
      return { ok: false, error: error.message }
    }
    return { ok: false, error: "Something went wrong." }
  }
}
