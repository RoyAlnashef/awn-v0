"use client"

import type {
  JobSharePayload,
  MemberSharePayload,
  MessageReaction,
} from "@/lib/messages-data"
import { cn } from "@/lib/utils"
import { JobShareCard } from "@/components/jobs/job-share-card"
import { PersonShareCard } from "@/components/people/person-share-card"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import {
  MessageReactionBadge,
} from "@/components/messages/message-reaction-badge"
import {
  MessageReactionPicker,
  MessageReactionTrigger,
} from "@/components/messages/message-reaction-picker"

function useMessageReactionHandlers(
  reactions: MessageReaction[] | undefined,
  onReact: (emoji: string | null) => void,
) {
  const mine = reactions?.find((r) => r.reactedByMe)

  function handleSelect(emoji: string) {
    if (mine?.emoji === emoji) {
      onReact(null)
    } else {
      onReact(emoji)
    }
  }

  return { handleSelect, hasReactions: Boolean(reactions?.length) }
}

function MessageReactionSurface({
  align,
  onSelect,
}: {
  align?: "start" | "end"
  onSelect: (emoji: string) => void
}) {
  return (
    <div
      className={cn(
        "message-reaction-surface absolute top-1/2 z-20 flex -translate-y-1/2 items-center rounded-full border border-border/60 bg-secondary p-0.5 opacity-0 shadow-md backdrop-blur-sm transition-opacity",
        "pointer-events-none group-hover/bubble-wrap:pointer-events-auto group-hover/bubble-wrap:opacity-100 group-focus-within/bubble-wrap:pointer-events-auto group-focus-within/bubble-wrap:opacity-100",
        align === "end" ? "right-full mr-1" : "left-full ml-1",
      )}
    >
      <MessageReactionPicker align={align} onSelect={onSelect}>
        <MessageReactionTrigger />
      </MessageReactionPicker>
    </div>
  )
}

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
  const { handleSelect, hasReactions } = useMessageReactionHandlers(
    reactions,
    onReact,
  )

  return (
    <div
      className={cn(
        "group/bubble-wrap relative w-fit max-w-[80%] min-w-0 overflow-visible",
        hasReactions && "pt-6",
        "after:absolute after:top-0 after:bottom-0 after:w-9 after:content-['']",
        align === "end"
          ? "self-end after:right-full"
          : "self-start after:left-full",
        className,
      )}
    >
      {hasReactions ? (
        <MessageReactionBadge
          reactions={reactions!}
          align={align === "end" ? "start" : "end"}
          onToggleMine={() => onReact(null)}
        />
      ) : null}
      <Bubble variant={variant} align={align} className="max-w-full">
        <BubbleContent>{children}</BubbleContent>
      </Bubble>

      <MessageReactionSurface align={align} onSelect={handleSelect} />
    </div>
  )
}

export function MessageJobShareWithReactions({
  jobShare,
  text,
  variant,
  align,
  reactions,
  onReact,
  className,
}: {
  jobShare: JobSharePayload
  text: string
  variant?: "default" | "muted"
  align?: "start" | "end"
  reactions?: MessageReaction[]
  onReact: (emoji: string | null) => void
  className?: string
}) {
  const trimmed = text.trim()
  const { handleSelect, hasReactions } = useMessageReactionHandlers(
    reactions,
    onReact,
  )

  return (
    <div
      className={cn(
        "group/bubble-wrap relative w-fit max-w-[min(20rem,80%)] min-w-0 overflow-visible",
        hasReactions && "pt-6",
        "after:absolute after:top-0 after:bottom-0 after:w-9 after:content-['']",
        align === "end"
          ? "self-end after:right-full"
          : "self-start after:left-full",
        className,
      )}
    >
      {hasReactions ? (
        <MessageReactionBadge
          reactions={reactions!}
          align={align === "end" ? "start" : "end"}
          onToggleMine={() => onReact(null)}
        />
      ) : null}
      <div
        className={cn(
          "flex w-full flex-col gap-2",
          align === "end" ? "items-end" : "items-start",
        )}
      >
        <JobShareCard jobShare={jobShare} variant="message" />
        {trimmed ? (
          <Bubble variant={variant} align={align} className="max-w-full">
            <BubbleContent>{trimmed}</BubbleContent>
          </Bubble>
        ) : null}
      </div>

      <MessageReactionSurface align={align} onSelect={handleSelect} />
    </div>
  )
}

export function MessageMemberShareWithReactions({
  memberShare,
  text,
  variant,
  align,
  reactions,
  onReact,
  className,
}: {
  memberShare: MemberSharePayload
  text: string
  variant?: "default" | "muted"
  align?: "start" | "end"
  reactions?: MessageReaction[]
  onReact: (emoji: string | null) => void
  className?: string
}) {
  const trimmed = text.trim()
  const { handleSelect, hasReactions } = useMessageReactionHandlers(
    reactions,
    onReact,
  )

  return (
    <div
      className={cn(
        "group/bubble-wrap relative w-fit max-w-[min(20rem,80%)] min-w-0 overflow-visible",
        hasReactions && "pt-6",
        "after:absolute after:top-0 after:bottom-0 after:w-9 after:content-['']",
        align === "end"
          ? "self-end after:right-full"
          : "self-start after:left-full",
        className,
      )}
    >
      {hasReactions ? (
        <MessageReactionBadge
          reactions={reactions!}
          align={align === "end" ? "start" : "end"}
          onToggleMine={() => onReact(null)}
        />
      ) : null}
      <div
        className={cn(
          "flex w-full flex-col gap-2",
          align === "end" ? "items-end" : "items-start",
        )}
      >
        <PersonShareCard memberShare={memberShare} variant="message" />
        {trimmed ? (
          <Bubble variant={variant} align={align} className="max-w-full">
            <BubbleContent>{trimmed}</BubbleContent>
          </Bubble>
        ) : null}
      </div>

      <MessageReactionSurface align={align} onSelect={handleSelect} />
    </div>
  )
}
