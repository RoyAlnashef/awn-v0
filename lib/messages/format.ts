import { differenceInCalendarDays, format, startOfDay } from "date-fns"

import type { ThreadMessage } from "@/lib/messages-data"

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

/** Returns a date separator label such as Today, Yesterday, or Mar 4. */
export function formatMessageDateLabel(
  date: Date,
  now: Date = new Date(),
): string {
  const diffDays = differenceInCalendarDays(startOfDay(now), startOfDay(date))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Yesterday"
  if (diffDays < 7) return format(date, "EEEE")
  if (date.getFullYear() === now.getFullYear()) {
    return format(date, "MMMM d")
  }

  return format(date, "MMMM d, yyyy")
}

export type ThreadMessageGroup = {
  key: string
  label: string
  messages: ThreadMessage[]
}

/** Groups consecutive thread messages under calendar-day separators. */
export function groupThreadMessagesByDate(
  messages: ThreadMessage[],
  now: Date = new Date(),
): ThreadMessageGroup[] {
  const groups: ThreadMessageGroup[] = []

  for (const message of messages) {
    const date = message.createdAt ? new Date(message.createdAt) : null
    const key = date ? startOfDay(date).toISOString() : "undated"
    const label = date ? formatMessageDateLabel(date, now) : "Earlier"

    const lastGroup = groups.at(-1)
    if (lastGroup?.key === key) {
      lastGroup.messages.push(message)
      continue
    }

    groups.push({ key, label, messages: [message] })
  }

  return groups
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
