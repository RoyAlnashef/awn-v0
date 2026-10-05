export const unreadCountKey = "dm-unread-count" as const
export const archivedCountKey = "dm-archived-count" as const

export function inboxKey(archived = false) {
  return archived ? (["dm-inbox", "archived"] as const) : (["dm-inbox"] as const)
}

export function threadKey(conversationId: string) {
  return ["dm-thread", conversationId] as const
}
