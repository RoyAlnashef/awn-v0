"use client"

import dynamic from "next/dynamic"
import { useCallback, useState } from "react"
import { Plus } from "lucide-react"
import type { EmojiClickData } from "emoji-picker-react"
import { Theme } from "emoji-picker-react"

import { MessageActionSheet } from "@/components/messages/message-action-sheet"
import {
  resolveMessageActionsAnchor,
  type MessageActionsAnchorMode,
} from "@/lib/messages/message-actions-anchor"
import { QUICK_REACTIONS } from "@/lib/messages/reactions"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"

const EMOJI_PICKER_WIDTH = 352

const reactionPopoverSurface =
  "message-reaction-surface bg-secondary text-secondary-foreground ring-1 ring-border/60 shadow-lg"

const reactionHover = "hover:bg-(--message-reaction-hover)"

const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
  loading: () => (
    <div
      className="flex items-center justify-center text-sm text-muted-foreground"
      style={{ width: EMOJI_PICKER_WIDTH, height: 380 }}
    >
      Loading…
    </div>
  ),
})

export function MessageActionsPopover({
  open,
  onOpenChange,
  onSelect,
  onReply,
  onCopy,
  onDelete,
  deleteLabel = "Unsend",
  align = "end",
  anchorMode = "trigger",
  triggerRef,
  bubbleRef,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect: (emoji: string) => void
  onReply?: () => void
  onCopy?: () => void
  onDelete?: () => void
  deleteLabel?: "Unsend" | "Delete"
  align?: "start" | "end"
  anchorMode?: MessageActionsAnchorMode
  triggerRef?: React.RefObject<Element | null>
  bubbleRef?: React.RefObject<Element | null>
  children?: React.ReactNode
}) {
  const [showFullPicker, setShowFullPicker] = useState(false)

  function closePopover() {
    onOpenChange(false)
    setShowFullPicker(false)
  }

  function handleSelect(emoji: string) {
    onSelect(emoji)
    closePopover()
  }

  function handleEmojiClick(data: EmojiClickData) {
    handleSelect(data.emoji)
  }

  function handleReply() {
    onReply?.()
    closePopover()
  }

  function handleCopy() {
    onCopy?.()
    closePopover()
  }

  function handleDelete() {
    onDelete?.()
    closePopover()
  }

  const hasActions = Boolean(onReply || onCopy || onDelete)

  const resolveAnchor = useCallback(() => {
    return (
      resolveMessageActionsAnchor(anchorMode, {
        trigger: triggerRef?.current ?? null,
        bubble: bubbleRef?.current ?? null,
      }) ?? null
    )
  }, [anchorMode, triggerRef, bubbleRef, open])

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) setShowFullPicker(false)
      }}
    >
      {children}
      <PopoverContent
        anchor={resolveAnchor}
        align={align === "end" ? "end" : "start"}
        side="top"
        sideOffset={8}
        finalFocus={false}
        className={cn(
          reactionPopoverSurface,
          "gap-0 p-0",
          showFullPicker
            ? "w-88 max-w-88 rounded-2xl"
            : "w-auto min-w-0 overflow-hidden rounded-2xl",
        )}
      >
        {showFullPicker ? (
          <div className="message-reaction-surface emoji-picker-awn rounded-2xl bg-secondary">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme={Theme.DARK}
              className="emoji-picker-awn-root"
              width={EMOJI_PICKER_WIDTH}
              height={380}
              searchPlaceholder="Search emoji…"
              previewConfig={{ showPreview: false }}
            />
          </div>
        ) : (
          <div className="flex flex-col items-stretch">
            <div className="message-reaction-surface flex items-center gap-0.5 p-1.5">
              {QUICK_REACTIONS.map((emoji) => (
                <Button
                  key={emoji}
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className={cn("size-9 rounded-xl text-lg", reactionHover)}
                  aria-label={`React with ${emoji}`}
                  onClick={() => handleSelect(emoji)}
                >
                  {emoji}
                </Button>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className={cn(
                  "size-9 rounded-full bg-(--message-reaction-emphasis) text-foreground",
                  reactionHover,
                )}
                aria-label="More emojis"
                onClick={() => setShowFullPicker(true)}
              >
                <Plus className="size-4" />
              </Button>
            </div>
            {hasActions ? (
              <>
                <Separator className="bg-border/60" />
                <div className="p-1">
                  <MessageActionSheet
                    onReply={onReply ? handleReply : undefined}
                    onCopy={onCopy ? handleCopy : undefined}
                    onDelete={onDelete ? handleDelete : undefined}
                    deleteLabel={deleteLabel}
                  />
                </div>
              </>
            ) : null}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

export function MessageActionTrigger({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <PopoverTrigger
      render={
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className={cn(
            "size-7 rounded-full text-muted-foreground hover:bg-(--message-reaction-hover) hover:text-foreground",
            className,
          )}
          aria-label="Message actions"
          {...props}
        />
      }
    >
      <Plus className="size-4" />
    </PopoverTrigger>
  )
}

/** @deprecated Use MessageActionsPopover + MessageActionTrigger */
export const MessageReactionPicker = MessageActionsPopover

/** @deprecated Use MessageActionTrigger */
export const MessageReactionTrigger = MessageActionTrigger
