"use client"

import type { MessageReaction } from "@/lib/messages-data"
import {
  distinctReactionEmojis,
  formatReactorNames,
  totalReactionCount,
} from "@/lib/messages/reactions"
import { cn } from "@/lib/utils"
import { BubbleReactions } from "@/components/ui/bubble"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

export function MessageReactionBadge({
  reactions,
  align = "end",
  onToggleMine,
}: {
  reactions: MessageReaction[]
  align?: "start" | "end"
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
              "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
              mine && "ring-offset-1",
            )}
            aria-label={`${total} reaction${total === 1 ? "" : "s"}`}
            onClick={(e) => {
              if (mine && onToggleMine) {
                e.preventDefault()
                onToggleMine()
              }
            }}
          >
            <BubbleReactions align={align} side="bottom">
              <span className="flex items-center gap-0.5 px-0.5">
                {emojis.length === 1 ? (
                  <span className="text-base leading-none">{emojis[0]}</span>
                ) : (
                  <>
                    <span className="flex -space-x-1">
                      {emojis.slice(0, 3).map((emoji) => (
                        <span
                          key={emoji}
                          className="inline-flex size-5 items-center justify-center rounded-full bg-card text-xs leading-none ring-2 ring-card"
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
            </BubbleReactions>
          </button>
        }
      />
      <HoverCardContent
        side="top"
        align={align === "end" ? "end" : "start"}
        className="w-auto max-w-56 px-3 py-2 text-xs whitespace-pre-line"
      >
        {tooltip || formatReactorNames(reactions)}
      </HoverCardContent>
    </HoverCard>
  )
}
