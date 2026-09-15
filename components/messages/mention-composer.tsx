"use client"

import { useCallback, useLayoutEffect, useRef } from "react"

import { MessageText } from "@/components/messages/message-text"
import type { ComposerMention } from "@/lib/messages/mentions"
import { cn } from "@/lib/utils"

/** text-base (1.5rem) on mobile, text-sm (1.25rem) on md+ × N lines + py-2 (1rem) */
const COMPOSER_MAX_LINES = 5

const composerMinHeight =
  "min-h-[calc(1.5rem+1rem)] md:min-h-[calc(1.25rem+1rem)]"
const composerMaxHeight = `max-h-[calc(1.5rem*${COMPOSER_MAX_LINES}+1rem)] md:max-h-[calc(1.25rem*${COMPOSER_MAX_LINES}+1rem)]`
const composerTextSize = "text-base md:text-sm leading-normal"

export function MentionComposer({
  value,
  onChange,
  onKeyDown,
  onClick,
  onKeyUp,
  placeholder,
  rows = 1,
  className,
  mentions,
  textareaRef,
}: {
  value: string
  onChange: (value: string, cursor: number) => void
  onKeyDown?: React.KeyboardEventHandler<HTMLTextAreaElement>
  onClick?: React.MouseEventHandler<HTMLTextAreaElement>
  onKeyUp?: React.KeyboardEventHandler<HTMLTextAreaElement>
  placeholder?: string
  rows?: number
  className?: string
  mentions: ComposerMention[]
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>
}) {
  const mirrorRef = useRef<HTMLDivElement>(null)
  const localRef = useRef<HTMLTextAreaElement>(null)
  const ref = textareaRef ?? localRef

  const syncScroll = useCallback(() => {
    const textarea = ref.current
    const mirror = mirrorRef.current
    if (!textarea || !mirror) return
    mirror.scrollTop = textarea.scrollTop
  }, [ref])

  useLayoutEffect(() => {
    syncScroll()
  }, [value, syncScroll])

  const mentionSpans = mentions.map(({ profileId, start, length }) => ({
    profileId,
    start,
    length,
  }))

  return (
    <div
      className={cn(
        "relative min-w-0 flex-1 overflow-hidden",
        composerMinHeight,
        composerMaxHeight,
        className,
      )}
    >
      <div
        ref={mirrorRef}
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 overflow-x-hidden overflow-y-auto whitespace-pre-wrap wrap-break-word px-3 py-2 scrollbar-none",
          composerTextSize,
        )}
      >
        {value ? (
          <MessageText
            text={value}
            mentions={mentionSpans}
            mentionTone="onSurface"
            interactive={false}
          />
        ) : null}
      </div>
      <textarea
        ref={ref}
        data-slot="input-group-control"
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(event) => {
          onChange(
            event.target.value,
            event.target.selectionStart ?? event.target.value.length,
          )
        }}
        onClick={onClick}
        onKeyUp={onKeyUp}
        onKeyDown={onKeyDown}
        onScroll={syncScroll}
        className={cn(
          "field-sizing-content relative z-10 block w-full resize-none overflow-y-auto bg-transparent px-3 py-2 text-transparent caret-foreground outline-none scrollbar-none",
          composerTextSize,
          composerMinHeight,
          composerMaxHeight,
        )}
      />
    </div>
  )
}
