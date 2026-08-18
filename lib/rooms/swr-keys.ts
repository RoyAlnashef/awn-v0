export const roomsListKey = "rooms-list" as const
export const roomsUnreadCountKey = "rooms-unread-count" as const

export function roomThreadKey(roomId: string) {
  return ["room-thread", roomId] as const
}

export function roomMembersPreviewKey(roomId: string) {
  return ["room-members-preview", roomId] as const
}
