import { getRoomThread } from "@/lib/rooms/actions"
import type { ThreadMessage } from "@/lib/messages-data"

export type RoomThreadCache = {
  messages: ThreadMessage[]
  hasMore: boolean
  oldestCursor: string | null
}

export async function fetchRoomThreadPage(
  roomId: string,
  options?: { before?: string },
): Promise<RoomThreadCache> {
  const result = await getRoomThread(roomId, options)
  if (!result.ok) throw new Error(result.error)

  return {
    messages: result.messages,
    hasMore: result.hasMore,
    oldestCursor: result.messages[0]?.createdAt ?? null,
  }
}
