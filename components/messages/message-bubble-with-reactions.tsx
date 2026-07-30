"use client"

import { useCallback, useRef, useState } from "react"

import type {
  JobSharePayload,
  MemberSharePayload,
  MessageReaction,
  MessageReplyPayload,
} from "@/lib/messages-data"
import { copyMessageText } from "@/lib/messages/reply"
import { cn } from "@/lib/utils"
import { JobShareCard } from "@/components/jobs/job-share-card"
import { PersonShareCard } from "@/components/people/person-share-card"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import {
  MessageReactionBadge,
} from "@/components/messages/message-reaction-badge"
import {
  MessageActionTrigger,
  MessageActionsPopover,
} from "@/components/messages/message-reaction-picker"
import { MessageReplyQuote } from "@/components/messages/message-reply-quote"
import {
  useCoarsePointer,
  useLongPress,
} from "@/lib/messages/use-long-press"

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

type MessageActionsShellProps = {
  align?: "start" | "end"
  reactions?: MessageReaction[]
  onReact: (emoji: string | null) => void
  onReply?: () => void
  onCopy?: () => void
  replyTo?: MessageReplyPayload
  repliedLabel?: string
  className?: string
  bubbleClassName?: string
  children: React.ReactNode
}

function MessageActionsShell({
  align,
  reactions,
  onReact,
  onReply,
  onCopy,
  replyTo,
  repliedLabel,
  className,
  bubbleClassName,
  children,
}: MessageActionsShellProps) {
  const [open, setOpen] = useState(false)
  const bubbleRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const coarsePointer = useCoarsePointer()
  const { handleSelect, hasReactions } = useMessageReactionHandlers(
    reactions,
    onReact,
  )

  const handleLongPress = useCallback(() => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(10)
    }
    setOpen(true)
  }, [])

  const longPressHandlers = useLongPress(handleLongPress)

  return (
    <MessageActionsPopover
      open={open}
      onOpenChange={setOpen}
      align={align}
      anchorMode={coarsePointer ? "bubble" : "trigger"}
      triggerRef={triggerRef}
      bubbleRef={bubbleRef}
      onSelect={handleSelect}
      onReply={onReply}
      onCopy={onCopy}
    >
      <div
        ref={bubbleRef}
        className={cn(
          "group/bubble-wrap relative w-fit min-w-0 overflow-visible select-none",
          hasReactions && "pt-6",
          "after:absolute after:top-0 after:bottom-0 after:w-9 after:content-['']",
          align === "end"
            ? "self-end after:right-full"
            : "self-start after:left-full",
          coarsePointer && "[-webkit-touch-callout:none] touch-manipulation",
          className,
        )}
        {...(coarsePointer ? longPressHandlers : {})}
      >
        {hasReactions ? (
          <MessageReactionBadge
            reactions={reactions!}
            align={align === "end" ? "start" : "end"}
            onToggleMine={() => onReact(null)}
          />
        ) : null}

        {children}

        <div
          ref={triggerRef}
          className={cn(
            "message-reaction-surface absolute top-1/2 z-20 flex -translate-y-1/2 items-center rounded-full border border-border/60 bg-secondary p-0.5 opacity-0 shadow-md backdrop-blur-sm transition-opacity",
            "pointer-events-none group-hover/bubble-wrap:pointer-events-auto group-hover/bubble-wrap:opacity-100 group-focus-within/bubble-wrap:pointer-events-auto group-focus-within/bubble-wrap:opacity-100",
            align === "end" ? "right-full mr-1" : "left-full ml-1",
            coarsePointer && "hidden",
          )}
        >
          <MessageActionTrigger />
        </div>
      </div>
    </MessageActionsPopover>
  )
}

export function MessageBubbleWithReactions({
  variant,
  align,
  children,
  reactions,
  onReact,
  onReply,
  onCopy,
  replyTo,
  repliedLabel,
  className,
}: {
  variant?: "default" | "muted"
  align?: "start" | "end"
  children: React.ReactNode
  reactions?: MessageReaction[]
  onReact: (emoji: string | null) => void
  onReply?: () => void
  onCopy?: () => void
  replyTo?: MessageReplyPayload
  repliedLabel?: string
  className?: string
}) {
  return (
    <MessageActionsShell
      align={align}
      reactions={reactions}
      onReact={onReact}
      onReply={onReply}
      onCopy={onCopy}
      replyTo={replyTo}
      repliedLabel={repliedLabel}
      className={cn("max-w-[80%]", className)}
    >
      <Bubble variant={variant} align={align} className="max-w-full">
        <BubbleContent>
          {replyTo ? (
            <MessageReplyQuote reply={replyTo} repliedLabel={repliedLabel} />
          ) : null}
          {children}
        </BubbleContent>
      </Bubble>
    </MessageActionsShell>
  )
}

export function MessageJobShareWithReactions({
  jobShare,
  text,
  variant,
  align,
  reactions,
  onReact,
  onReply,
  onCopy,
  replyTo,
  repliedLabel,
  className,
}: {
  jobShare: JobSharePayload
  text: string
  variant?: "default" | "muted"
  align?: "start" | "end"
  reactions?: MessageReaction[]
  onReact: (emoji: string | null) => void
  onReply?: () => void
  onCopy?: () => void
  replyTo?: MessageReplyPayload
  repliedLabel?: string
  className?: string
}) {
  const trimmed = text.trim()

  return (
    <MessageActionsShell
      align={align}
      reactions={reactions}
      onReact={onReact}
      onReply={onReply}
      onCopy={onCopy}
      replyTo={replyTo}
      repliedLabel={repliedLabel}
      className={cn("max-w-[min(20rem,80%)]", className)}
    >
      <div
        className={cn(
          "flex w-full flex-col gap-2",
          align === "end" ? "items-end" : "items-start",
        )}
      >
        {replyTo ? (
          <Bubble variant={variant} align={align} className="max-w-full">
            <BubbleContent>
              <MessageReplyQuote reply={replyTo} repliedLabel={repliedLabel} />
            </BubbleContent>
          </Bubble>
        ) : null}
        <JobShareCard jobShare={jobShare} variant="message" />
        {trimmed ? (
          <Bubble variant={variant} align={align} className="max-w-full">
            <BubbleContent>{trimmed}</BubbleContent>
          </Bubble>
        ) : null}
      </div>
    </MessageActionsShell>
  )
}

export function MessageMemberShareWithReactions({
  memberShare,
  text,
  variant,
  align,
  reactions,
  onReact,
  onReply,
  onCopy,
  replyTo,
  repliedLabel,
  className,
}: {
  memberShare: MemberSharePayload
  text: string
  variant?: "default" | "muted"
  align?: "start" | "end"
  reactions?: MessageReaction[]
  onReact: (emoji: string | null) => void
  onReply?: () => void
  onCopy?: () => void
  replyTo?: MessageReplyPayload
  repliedLabel?: string
  className?: string
}) {
  const trimmed = text.trim()

  return (
    <MessageActionsShell
      align={align}
      reactions={reactions}
      onReact={onReact}
      onReply={onReply}
      onCopy={onCopy}
      replyTo={replyTo}
      repliedLabel={repliedLabel}
      className={cn("max-w-[min(20rem,80%)]", className)}
    >
      <div
        className={cn(
          "flex w-full flex-col gap-2",
          align === "end" ? "items-end" : "items-start",
        )}
      >
        {replyTo ? (
          <Bubble variant={variant} align={align} className="max-w-full">
            <BubbleContent>
              <MessageReplyQuote reply={replyTo} repliedLabel={repliedLabel} />
            </BubbleContent>
          </Bubble>
        ) : null}
        <PersonShareCard memberShare={memberShare} variant="message" />
        {trimmed ? (
          <Bubble variant={variant} align={align} className="max-w-full">
            <BubbleContent>{trimmed}</BubbleContent>
          </Bubble>
        ) : null}
      </div>
    </MessageActionsShell>
  )
}
