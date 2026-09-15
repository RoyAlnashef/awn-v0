"use client"

import type { MessageMentionSpan } from "@/lib/messages-data"
import { renderMessageWithMentions } from "@/lib/messages/mentions"
import { cn } from "@/lib/utils"

const mentionToneClasses = {
  onPrimary: "font-semibold text-primary-foreground no-underline",
  onSurface: "font-semibold text-primary no-underline",
  /** Composer mirror: color only so caret aligns with the textarea. */
  composer: "text-primary no-underline",
} as const

export function MessageText({
  text,
  mentions,
  onMentionClick,
  mentionTone = "onSurface",
  interactive = true,
  className,
}: {
  text: string
  mentions?: MessageMentionSpan[]
  onMentionClick?: (profileId: string) => void
  mentionTone?: keyof typeof mentionToneClasses
  interactive?: boolean
  className?: string
}) {
  const segments = renderMessageWithMentions(text, mentions)
  const mentionClassName = mentionToneClasses[mentionTone]

  return (
    <span className={cn("wrap-anywhere", className)}>
      {segments.map((segment, index) => {
        if (segment.type === "mention") {
          if (!interactive) {
            return (
              <span
                key={`mention-${segment.profileId}-${index}`}
                className={cn("inline", mentionClassName)}
              >
                {segment.value}
              </span>
            )
          }

          return (
            <button
              key={`mention-${segment.profileId}-${index}`}
              type="button"
              className={cn(
                "inline hover:no-underline focus-visible:underline focus-visible:outline-none",
                mentionClassName,
              )}
              onClick={(event) => {
                event.stopPropagation()
                onMentionClick?.(segment.profileId)
              }}
            >
              {segment.value}
            </button>
          )
        }

        return <span key={`text-${index}`}>{segment.value}</span>
      })}
    </span>
  )
}
