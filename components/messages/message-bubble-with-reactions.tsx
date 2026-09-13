"use client"

import { useCallback, useRef, useState } from "react"

import type {
  JobSharePayload,
  MemberSharePayload,
  MessageReaction,
  MessageReplyPayload,
} from "@/lib/messages-data"
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
  /** Badge vertical placement relative to this shell's content. */
  reactionSide?: "top-edge" | "bottom"
  /** Badge horizontal placement; defaults to inward-facing corner for message align. */
  reactionAlign?: "start" | "end"
  onReact: (emoji: string | null) => void
  onReply?: () => void
  onCopy?: () => void
  onDelete?: () => void
  deleteLabel?: "Unsend" | "Delete"
  replyTo?: MessageReplyPayload
  className?: string
  bubbleClassName?: string
  children: React.ReactNode
}

function MessageActionsShell({
  align,
  reactions,
  reactionSide = "top-edge",
  reactionAlign,
  onReact,
  onReply,
  onCopy,
  onDelete,
  deleteLabel,
  replyTo,
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
  const badgeAlign =
    reactionAlign ?? (align === "end" ? "start" : "end")

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
      onDelete={onDelete}
      deleteLabel={deleteLabel}
    >
      <div
        ref={bubbleRef}
        className={cn(
          "group/bubble-wrap relative w-max max-w-full min-w-0 overflow-visible select-none",
          "after:absolute after:top-0 after:bottom-0 after:w-9 after:content-['']",
          align === "end"
            ? "self-end after:right-full"
            : "self-start after:left-full",
          coarsePointer && "[-webkit-touch-callout:none] touch-manipulation",
          className,
        )}
        {...(coarsePointer ? longPressHandlers : {})}
      >
        <div className="relative min-w-0 max-w-full w-full">
          <div
            className={cn(
              hasReactions && reactionSide === "bottom" && "pb-6",
            )}
          >
            {children}
          </div>
          {hasReactions ? (
            <MessageReactionBadge
              reactions={reactions!}
              side={reactionSide}
              align={badgeAlign}
              onToggleMine={() => onReact(null)}
            />
          ) : null}
        </div>

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
  onDelete,
  deleteLabel,
  replyTo,
  className,
}: {
  variant?: "default" | "muted"
  align?: "start" | "end"
  children: React.ReactNode
  reactions?: MessageReaction[]
  onReact: (emoji: string | null) => void
  onReply?: () => void
  onCopy?: () => void
  onDelete?: () => void
  deleteLabel?: "Unsend" | "Delete"
  replyTo?: MessageReplyPayload
  className?: string
}) {
  return (
    <MessageActionsShell
      align={align}
      reactions={reactions}
      onReact={onReact}
      onReply={onReply}
      onCopy={onCopy}
      onDelete={onDelete}
      deleteLabel={deleteLabel}
      replyTo={replyTo}
      className={cn("max-w-[80%] min-w-0", className)}
    >
      <Bubble variant={variant} align={align} className="w-full max-w-full">
        <BubbleContent>
          {replyTo ? (
            <MessageReplyQuote reply={replyTo} />
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
  attachmentReactions,
  onReactBody,
  onReactAttachment,
  onReply,
  onCopy,
  onDelete,
  deleteLabel,
  replyTo,
  className,
}: {
  jobShare: JobSharePayload
  text: string
  variant?: "default" | "muted"
  align?: "start" | "end"
  reactions?: MessageReaction[]
  attachmentReactions?: MessageReaction[]
  onReactBody: (emoji: string | null) => void
  onReactAttachment: (emoji: string | null) => void
  onReply?: () => void
  onCopy?: () => void
  onDelete?: () => void
  deleteLabel?: "Unsend" | "Delete"
  replyTo?: MessageReplyPayload
  className?: string
}) {
  const trimmed = text.trim()
  const hasText = Boolean(trimmed)
  const messageActions = { onReply, onDelete, deleteLabel }

  return (
    <div
      className={cn(
        "flex w-full min-w-0 max-w-[min(20rem,80%)] flex-col gap-2",
        align === "end" ? "items-end self-end" : "items-start self-start",
        className,
      )}
    >
      {replyTo ? (
        <Bubble variant={variant} align={align} className="w-full max-w-full">
          <BubbleContent>
            <MessageReplyQuote reply={replyTo} />
          </BubbleContent>
        </Bubble>
      ) : null}
      <MessageActionsShell
        align={align}
        reactions={attachmentReactions}
        onReact={onReactAttachment}
        {...messageActions}
        className="w-full min-w-0 max-w-full"
      >
        <JobShareCard jobShare={jobShare} variant="message" />
      </MessageActionsShell>
      {hasText ? (
        <MessageActionsShell
          align={align}
          reactions={reactions}
          onReact={onReactBody}
          onCopy={onCopy}
          {...messageActions}
          className="min-w-0 max-w-full"
        >
          <Bubble variant={variant} align={align} className="w-full max-w-full">
            <BubbleContent>{trimmed}</BubbleContent>
          </Bubble>
        </MessageActionsShell>
      ) : null}
    </div>
  )
}

export function MessageMemberShareWithReactions({
  memberShare,
  text,
  variant,
  align,
  reactions,
  attachmentReactions,
  onReactBody,
  onReactAttachment,
  onReply,
  onCopy,
  onDelete,
  deleteLabel,
  replyTo,
  className,
}: {
  memberShare: MemberSharePayload
  text: string
  variant?: "default" | "muted"
  align?: "start" | "end"
  reactions?: MessageReaction[]
  attachmentReactions?: MessageReaction[]
  onReactBody: (emoji: string | null) => void
  onReactAttachment: (emoji: string | null) => void
  onReply?: () => void
  onCopy?: () => void
  onDelete?: () => void
  deleteLabel?: "Unsend" | "Delete"
  replyTo?: MessageReplyPayload
  className?: string
}) {
  const trimmed = text.trim()
  const hasText = Boolean(trimmed)
  const messageActions = { onReply, onDelete, deleteLabel }

  return (
    <div
      className={cn(
        "flex w-full min-w-0 max-w-[min(20rem,80%)] flex-col gap-2",
        align === "end" ? "items-end self-end" : "items-start self-start",
        className,
      )}
    >
      {replyTo ? (
        <Bubble variant={variant} align={align} className="w-full max-w-full">
          <BubbleContent>
            <MessageReplyQuote reply={replyTo} />
          </BubbleContent>
        </Bubble>
      ) : null}
      <MessageActionsShell
        align={align}
        reactions={attachmentReactions}
        onReact={onReactAttachment}
        {...messageActions}
        className="min-w-0 max-w-full"
      >
        <PersonShareCard memberShare={memberShare} variant="message" />
      </MessageActionsShell>
      {hasText ? (
        <MessageActionsShell
          align={align}
          reactions={reactions}
          onReact={onReactBody}
          onCopy={onCopy}
          {...messageActions}
          className="min-w-0 max-w-full"
        >
          <Bubble variant={variant} align={align} className="w-full max-w-full">
            <BubbleContent>{trimmed}</BubbleContent>
          </Bubble>
        </MessageActionsShell>
      ) : null}
    </div>
  )
}
