/** Returns a compact relative time label for inbox rows. */
export function formatRelativeTime(iso: string): string {
  const date = new Date(iso)
  const now = Date.now()
  const diffMs = now - date.getTime()

  if (diffMs < 60_000) return "Now"

  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 60) return `${minutes}m`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d`

  const weeks = Math.floor(days / 7)
  return `${weeks}w`
}

/** Returns a clock label for message bubbles. */
export function formatMessageTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  })
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  )
}

/** Extracts a profile UUID from a local stub id like `person-{uuid}`. */
export function parsePersonConversationId(id: string): string | null {
  if (!id.startsWith("person-")) return null
  const profileId = id.slice("person-".length)
  return isUuid(profileId) ? profileId : null
}

export function isPersistedConversation(conversation: {
  id: string
  isPersisted?: boolean
  otherProfileId?: string
}): boolean {
  if (conversation.isPersisted) return true
  if (isUuid(conversation.id)) return true
  return Boolean(
    conversation.otherProfileId && isUuid(conversation.otherProfileId),
  )
}
