export const inboxKey = "dm-inbox" as const
export const unreadCountKey = "dm-unread-count" as const

export function threadKey(conversationId: string) {
  return ["dm-thread", conversationId] as const
}
