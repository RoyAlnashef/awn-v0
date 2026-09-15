"use client"

import { useCallback, useLayoutEffect, useRef } from "react"

import { MessageText } from "@/components/messages/message-text"
import type { ComposerMention } from "@/lib/messages/mentions"
import { cn } from "@/lib/utils"

const COMPOSER_MAX_LINES = 5

/** Static literals only — Tailwind cannot scan template-built class names. */
const composerMinHeight = "min-h-[2.5rem] md:min-h-[2.25rem]"
const composerMaxHeight = "max-h-[8.5rem] md:max-h-[7.25rem]"
const composerTextSize = "text-base md:text-sm leading-normal"

function resolveHeightLimit(
  textarea: HTMLTextAreaElement,
  property: "maxHeight" | "minHeight",
  lineCount?: number,
): number | null {
  const styles = getComputedStyle(textarea)
  const parsed = Number.parseFloat(styles[property])
  if (Number.isFinite(parsed) && parsed > 0) return parsed

  const lineHeight = Number.parseFloat(styles.lineHeight)
  const padding =
    Number.parseFloat(styles.paddingTop) +
    Number.parseFloat(styles.paddingBottom)
  if (!Number.isFinite(lineHeight) || lineHeight <= 0) return null

  if (property === "maxHeight" && lineCount) {
    return lineHeight * lineCount + padding
  }
  if (property === "minHeight") {
    return lineHeight + padding
  }
  return null
}

function adjustComposerHeight(textarea: HTMLTextAreaElement) {
  const maxHeight =
    resolveHeightLimit(textarea, "maxHeight", COMPOSER_MAX_LINES) ?? Infinity
  const minHeight = resolveHeightLimit(textarea, "minHeight") ?? 0

  // Use 1px (not 0) so iOS WebKit reports a reliable scrollHeight.
  textarea.style.height = "1px"
  const scrollHeight = textarea.scrollHeight

  const nextHeight = Math.max(minHeight, Math.min(scrollHeight, maxHeight))

  textarea.style.height = `${nextHeight}px`
  textarea.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden"
}

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

  const measureHeight = useCallback(() => {
    const textarea = ref.current
    if (!textarea) return
    adjustComposerHeight(textarea)
    syncScroll()
  }, [ref, syncScroll])

  useLayoutEffect(() => {
    measureHeight()
  }, [value, measureHeight])

  useLayoutEffect(() => {
    const textarea = ref.current
    if (!textarea) return

    const observer = new ResizeObserver(() => {
      measureHeight()
    })
    observer.observe(textarea)

    return () => observer.disconnect()
  }, [measureHeight, ref])

  const mentionSpans = mentions.map(({ profileId, start, length }) => ({
    profileId,
    start,
    length,
  }))

  return (
    <div
      className={cn(
        "relative min-h-0 min-w-0 flex-1 overflow-hidden",
        composerMinHeight,
        composerMaxHeight,
        className,
      )}
    >
      <div
        ref={mirrorRef}
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 overflow-x-hidden overflow-y-auto whitespace-pre-wrap wrap-break-word px-3 py-2 scrollbar-none [-webkit-overflow-scrolling:touch]",
          composerTextSize,
        )}
      >
        {value ? (
          <MessageText
            text={value}
            mentions={mentionSpans}
            mentionTone="composer"
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
          "relative z-10 box-border block h-full max-h-full min-h-0 w-full resize-none overflow-x-hidden bg-transparent px-3 py-2 text-transparent caret-foreground outline-none scrollbar-none [-webkit-overflow-scrolling:touch]",
          composerTextSize,
          composerMinHeight,
          composerMaxHeight,
        )}
      />
    </div>
  )
}
