"use client"

import type { MessageReaction } from "@/lib/messages-data"
import {
  distinctReactionEmojis,
  formatReactorNames,
  totalReactionCount,
} from "@/lib/messages/reactions"
import { cn } from "@/lib/utils"
import { bubbleReactionsVariants } from "@/components/ui/bubble"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

export function MessageReactionBadge({
  reactions,
  align = "end",
  side = "top-edge",
  onToggleMine,
}: {
  reactions: MessageReaction[]
  align?: "start" | "end"
  side?: "top-edge" | "bottom"
  onToggleMine?: () => void
}) {
  if (!reactions.length) return null

  const emojis = distinctReactionEmojis(reactions)
  const total = totalReactionCount(reactions)
  const mine = reactions.find((r) => r.reactedByMe)
  const tooltip = reactions
    .map((reaction) => `${reaction.emoji} ${reaction.reactors.map((r) => r.name).join(", ")}`)
    .join("\n")

  return (
    <HoverCard>
      <HoverCardTrigger
        render={
          <button
            type="button"
            className={cn(
              bubbleReactionsVariants({ side, align }),
              "ring-secondary cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-0",
            )}
            aria-label={`${total} reaction${total === 1 ? "" : "s"}`}
            onClick={(e) => {
              if (mine && onToggleMine) {
                e.preventDefault()
                onToggleMine()
              }
            }}
          >
            <span className="flex items-center gap-0.5 px-0.5">
              {emojis.length === 1 ? (
                <span className="text-base leading-none">{emojis[0]}</span>
              ) : (
                <>
                  <span className="flex -space-x-1">
                    {emojis.slice(0, 3).map((emoji) => (
                      <span
                        key={emoji}
                        className="inline-flex size-5 items-center justify-center rounded-full bg-secondary text-xs leading-none ring-2 ring-secondary"
                      >
                        {emoji}
                      </span>
                    ))}
                  </span>
                  {total > 1 ? (
                    <span className="pl-0.5 text-xs font-medium text-muted-foreground">
                      {total}
                    </span>
                  ) : null}
                </>
              )}
            </span>
          </button>
        }
      />
      <HoverCardContent
        side={side === "bottom" ? "bottom" : "top"}
        align="center"
        className="w-auto max-w-56 bg-secondary px-3 py-2 text-xs whitespace-pre-line"
      >
        {tooltip || formatReactorNames(reactions)}
      </HoverCardContent>
    </HoverCard>
  )
}
