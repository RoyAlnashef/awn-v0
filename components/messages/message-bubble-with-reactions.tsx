"use client"

import type { MessageReaction } from "@/lib/messages-data"
import { cn } from "@/lib/utils"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import {
  MessageReactionBadge,
} from "@/components/messages/message-reaction-badge"
import {
  MessageReactionPicker,
  MessageReactionTrigger,
} from "@/components/messages/message-reaction-picker"

export function MessageBubbleWithReactions({
  variant,
  align,
  children,
  reactions,
  onReact,
  className,
}: {
  variant?: "default" | "muted"
  align?: "start" | "end"
  children: React.ReactNode
  reactions?: MessageReaction[]
  onReact: (emoji: string | null) => void
  className?: string
}) {
  const mine = reactions?.find((r) => r.reactedByMe)

  function handleSelect(emoji: string) {
    if (mine?.emoji === emoji) {
      onReact(null)
    } else {
      onReact(emoji)
    }
  }

  return (
    <div
      className={cn(
        "group/bubble-wrap relative w-fit max-w-[80%] min-w-0",
        "after:absolute after:top-0 after:bottom-0 after:w-9 after:content-['']",
        align === "end"
          ? "self-end after:right-full"
          : "self-start after:left-full",
        className,
      )}
    >
      <Bubble variant={variant} align={align} className="max-w-full">
        <BubbleContent>{children}</BubbleContent>
        {reactions?.length ? (
          <MessageReactionBadge
            reactions={reactions}
            align={align === "end" ? "start" : "end"}
            onToggleMine={() => onReact(null)}
          />
        ) : null}
      </Bubble>

      <div
        className={cn(
          "absolute top-1/2 z-20 flex -translate-y-1/2 items-center rounded-full border border-border/60 bg-popover/95 p-0.5 opacity-0 shadow-md backdrop-blur-sm transition-opacity",
          "pointer-events-none group-hover/bubble-wrap:pointer-events-auto group-hover/bubble-wrap:opacity-100 group-focus-within/bubble-wrap:pointer-events-auto group-focus-within/bubble-wrap:opacity-100",
          align === "end" ? "right-full mr-1" : "left-full ml-1",
        )}
      >
        <MessageReactionPicker align={align} onSelect={handleSelect}>
          <MessageReactionTrigger />
        </MessageReactionPicker>
      </div>
    </div>
  )
}
