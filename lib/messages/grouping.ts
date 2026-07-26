import type { ThreadMessage } from "@/lib/messages-data"

export const ROOM_MESSAGE_GROUP_GAP_MS = 2 * 60_000

/** Whether two adjacent room messages belong to the same visual group. */
export function isSameRoomMessageGroup(
  a: ThreadMessage,
  b: ThreadMessage,
): boolean {
  if (a.from !== b.from) return false
  if (a.from === "them" && a.author !== b.author) return false

  if (a.createdAt && b.createdAt) {
    return (
      Math.abs(new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) <=
      ROOM_MESSAGE_GROUP_GAP_MS
    )
  }

  return true
}
