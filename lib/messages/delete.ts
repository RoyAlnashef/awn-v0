import { isUuid } from "@/lib/messages/format"
import { messageDisplayPreview } from "@/lib/messages/member-share"
import type { ThreadMessage } from "@/lib/messages-data"

export function canDeleteOwnMessage(
  message: ThreadMessage,
  isPersisted: boolean,
): boolean {
  if (message.from !== "me") return false
  if (message.id.startsWith("optimistic-")) return false
  if (isPersisted) return isUuid(message.id)
  return true
}

export function canHideReceivedMessage(
  message: ThreadMessage,
  isPersisted: boolean,
): boolean {
  if (message.from !== "them") return false
  if (message.id.startsWith("optimistic-")) return false
  if (isPersisted) return isUuid(message.id)
  return false
}

export function applyMessageHide<T extends { messages: ThreadMessage[] }>(
  cache: T,
  messageId: string,
): T {
  return applyMessageDelete(cache, messageId)
}

export function applyMessageDelete<T extends { messages: ThreadMessage[] }>(
  cache: T,
  messageId: string,
): T {
  return {
    ...cache,
    messages: cache.messages
      .filter((message) => message.id !== messageId)
      .map((message) => {
        if (message.replyTo?.messageId !== messageId) return message
        return {
          ...message,
          replyTo: {
            ...message.replyTo,
            unavailable: true,
          },
        }
      }),
  }
}

export function applyLocalMessageDelete(
  messages: ThreadMessage[],
  messageId: string,
): ThreadMessage[] {
  return applyMessageDelete({ messages }, messageId).messages
}

/** Preview text for inbox bump after deleting the latest message. */
export function previewForMessage(message: ThreadMessage): string {
  return messageDisplayPreview(
    message.text,
    message.jobShare,
    message.memberShare,
  )
}

export function isLatestMessage(
  messages: ThreadMessage[],
  messageId: string,
): boolean {
  if (messages.length === 0) return false
  return messages[messages.length - 1]?.id === messageId
}

export function previewAfterDelete(
  messages: ThreadMessage[],
  deletedMessageId: string,
): { preview: string; from: "me" | "them" } | null {
  const remaining = messages.filter((m) => m.id !== deletedMessageId)
  if (remaining.length === 0) {
    return { preview: "", from: "me" }
  }

  const latest = remaining[remaining.length - 1]!
  return {
    preview: previewForMessage(latest),
    from: latest.from,
  }
}
