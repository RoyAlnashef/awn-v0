import type { MessageReaction, ThreadMessage } from "@/lib/messages-data"

export const QUICK_REACTIONS = ["❤️", "😆", "😮", "😢", "😡", "👍"] as const

export type ReactionUser = {
  id: string
  name: string
}

function sortReactions(reactions: MessageReaction[]): MessageReaction[] {
  return [...reactions].sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count
    return a.emoji.localeCompare(b.emoji)
  })
}

/** Toggle or replace the current user's reaction on a message (local/mock threads). */
export function applyLocalReaction(
  messages: ThreadMessage[],
  messageId: string,
  emoji: string | null,
  currentUser: ReactionUser,
): ThreadMessage[] {
  return messages.map((message) => {
    if (message.id !== messageId) return message

    const reactions = message.reactions ?? []
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

      return {
        ...message,
        reactions: next.length > 0 ? sortReactions(next) : undefined,
      }
    }

    let next = reactions.map((reaction) => {
      if (!reaction.reactedByMe) return reaction
      const count = reaction.count - 1
      if (count <= 0) return null
      return {
        ...reaction,
        count,
        reactedByMe: false,
        reactors: reaction.reactors.filter((r) => r.id !== currentUser.id),
      }
    }).filter((r): r is MessageReaction => r !== null)

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

    return { ...message, reactions: sortReactions(next) }
  })
}

export function patchMessageReactions<T extends { messages: ThreadMessage[] }>(
  cache: T,
  messageId: string,
  reactions: MessageReaction[],
): T {
  return {
    ...cache,
    messages: cache.messages.map((message) =>
      message.id === messageId
        ? { ...message, reactions: reactions.length > 0 ? reactions : undefined }
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
