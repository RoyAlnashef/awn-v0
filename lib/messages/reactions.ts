import type {
  MessageReaction,
  MessageReactionTarget,
  ThreadMessage,
} from "@/lib/messages-data"

export const QUICK_REACTIONS = ["❤️", "😆", "😮", "😢", "😡", "👍"] as const

export type ReactionUser = {
  id: string
  name: string
}

function reactionKey(
  target: MessageReactionTarget,
): "reactions" | "attachmentReactions" {
  return target === "attachment" ? "attachmentReactions" : "reactions"
}

function sortReactions(reactions: MessageReaction[]): MessageReaction[] {
  return [...reactions].sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count
    return a.emoji.localeCompare(b.emoji)
  })
}

function updateReactionList(
  reactions: MessageReaction[],
  emoji: string | null,
  currentUser: ReactionUser,
): MessageReaction[] | undefined {
  const existingMine = reactions.find((r) => r.reactedByMe)

  if (!emoji || existingMine?.emoji === emoji) {
    const next = reactions
      .map((reaction) => {
        if (!reaction.reactedByMe) return reaction
        const count = reaction.count - 1
        if (count <= 0) return null
        return {
          ...reaction,
          count,
          reactedByMe: false,
          reactors: reaction.reactors.filter((r) => r.id !== currentUser.id),
        }
      })
      .filter((r): r is MessageReaction => r !== null)

    return next.length > 0 ? sortReactions(next) : undefined
  }

  let next = reactions
    .map((reaction) => {
      if (!reaction.reactedByMe) return reaction
      const count = reaction.count - 1
      if (count <= 0) return null
      return {
        ...reaction,
        count,
        reactedByMe: false,
        reactors: reaction.reactors.filter((r) => r.id !== currentUser.id),
      }
    })
    .filter((r): r is MessageReaction => r !== null)

  const existingEmoji = next.find((r) => r.emoji === emoji)
  if (existingEmoji) {
    next = next.map((reaction) =>
      reaction.emoji === emoji
        ? {
            ...reaction,
            count: reaction.count + 1,
            reactedByMe: true,
            reactors: [...reaction.reactors, currentUser],
          }
        : reaction,
    )
  } else {
    next.push({
      emoji,
      count: 1,
      reactedByMe: true,
      reactors: [currentUser],
    })
  }

  return sortReactions(next)
}

/** Toggle or replace the current user's reaction on a message (local/mock threads). */
export function applyLocalReaction(
  messages: ThreadMessage[],
  messageId: string,
  emoji: string | null,
  currentUser: ReactionUser,
  target: MessageReactionTarget = "body",
): ThreadMessage[] {
  const key = reactionKey(target)

  return messages.map((message) => {
    if (message.id !== messageId) return message

    const next = updateReactionList(message[key] ?? [], emoji, currentUser)
    return { ...message, [key]: next }
  })
}

export function patchMessageReactions<T extends { messages: ThreadMessage[] }>(
  cache: T,
  messageId: string,
  reactions: MessageReaction[],
  attachmentReactions: MessageReaction[],
): T {
  return {
    ...cache,
    messages: cache.messages.map((message) =>
      message.id === messageId
        ? {
            ...message,
            reactions: reactions.length > 0 ? reactions : undefined,
            attachmentReactions:
              attachmentReactions.length > 0 ? attachmentReactions : undefined,
          }
        : message,
    ),
  }
}

export function formatReactorNames(reactions: MessageReaction[]): string {
  const names = reactions.flatMap((r) => r.reactors.map((reactor) => reactor.name))
  const unique = [...new Set(names)]
  if (unique.length <= 3) return unique.join(", ")
  return `${unique.slice(0, 3).join(", ")} +${unique.length - 3} more`
}

export function totalReactionCount(reactions: MessageReaction[]): number {
  return reactions.reduce((sum, r) => sum + r.count, 0)
}

export function distinctReactionEmojis(reactions: MessageReaction[]): string[] {
  return reactions.map((r) => r.emoji)
}
