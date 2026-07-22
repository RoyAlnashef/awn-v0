"use client"

import dynamic from "next/dynamic"
import { useState } from "react"
import { Plus, Smile } from "lucide-react"
import type { EmojiClickData } from "emoji-picker-react"
import { Theme } from "emoji-picker-react"

import { QUICK_REACTIONS } from "@/lib/messages/reactions"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const EMOJI_PICKER_WIDTH = 352

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

export function MessageReactionPicker({
  onSelect,
  align = "end",
  children,
}: {
  onSelect: (emoji: string) => void
  align?: "start" | "end"
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [showFullPicker, setShowFullPicker] = useState(false)

  function handleSelect(emoji: string) {
    onSelect(emoji)
    setOpen(false)
    setShowFullPicker(false)
  }

  function handleEmojiClick(data: EmojiClickData) {
    handleSelect(data.emoji)
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setShowFullPicker(false)
      }}
    >
      <PopoverTrigger render={children as React.ReactElement} />
      <PopoverContent
        align={align === "end" ? "end" : "start"}
        side="top"
        sideOffset={8}
        className={cn(
          "gap-0 shadow-lg",
          showFullPicker
            ? "w-[352px] max-w-[352px] rounded-2xl p-0 ring-1 ring-foreground/5"
            : "w-auto overflow-hidden p-1.5",
        )}
      >
        {showFullPicker ? (
          <div className="emoji-picker-awn rounded-2xl bg-popover">
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
          <div className="flex items-center gap-0.5">
            {QUICK_REACTIONS.map((emoji) => (
              <Button
                key={emoji}
                type="button"
                variant="ghost"
                size="icon-sm"
                className="size-9 rounded-xl text-lg hover:bg-accent"
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
              className="size-9 rounded-full bg-muted text-foreground hover:bg-accent"
              aria-label="More emojis"
              onClick={() => setShowFullPicker(true)}
            >
              <Plus className="size-4" />
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

export function MessageReactionTrigger({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      className={cn(
        "size-7 rounded-full text-muted-foreground hover:bg-background/80 hover:text-foreground",
        className,
      )}
      aria-label="Add reaction"
      {...props}
    >
      <Smile className="size-4" />
    </Button>
  )
}
