import { getConversationThread } from "@/lib/messages/actions"
import type { ThreadMessage } from "@/lib/messages-data"

export type ThreadCache = {
  messages: ThreadMessage[]
  otherLastReadAt: string | null
  hasMore: boolean
  oldestCursor: string | null
}

export async function fetchThreadPage(
  conversationId: string,
  options?: { before?: string },
): Promise<ThreadCache> {
  const result = await getConversationThread(conversationId, options)
  if (!result.ok) throw new Error(result.error)

  return {
    messages: result.messages,
    otherLastReadAt: result.otherLastReadAt,
    hasMore: result.hasMore,
    oldestCursor: result.messages[0]?.createdAt ?? null,
  }
}
