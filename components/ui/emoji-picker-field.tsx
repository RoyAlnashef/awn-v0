"use client"

import dynamic from "next/dynamic"
import { useState } from "react"
import type { EmojiClickData } from "emoji-picker-react"
import { Theme } from "emoji-picker-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

const EMOJI_PICKER_WIDTH = 352

const popoverSurface =
  "message-reaction-surface bg-secondary text-secondary-foreground ring-1 ring-border/60 shadow-lg"

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

export function EmojiPickerField({
  value,
  onChange,
  id,
  disabled = false,
  className,
}: {
  value: string
  onChange: (emoji: string) => void
  id?: string
  disabled?: boolean
  className?: string
}) {
  const [open, setOpen] = useState(false)

  function handleEmojiClick(data: EmojiClickData) {
    onChange(data.emoji)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            id={id}
            type="button"
            variant="outline"
            disabled={disabled}
            className={cn(
              "h-10 w-full justify-start gap-2 px-3 font-normal",
              className,
            )}
            aria-label="Choose emoji"
          >
            <span className="text-xl leading-none">{value}</span>
            <span className="text-sm text-muted-foreground">Choose emoji</span>
          </Button>
        }
      />
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={8}
        className={cn(popoverSurface, "w-88 max-w-88 gap-0 rounded-2xl p-0")}
      >
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
      </PopoverContent>
    </Popover>
  )
}
