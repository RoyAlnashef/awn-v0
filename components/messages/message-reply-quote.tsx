"use client"

import type { MessageReplyPayload } from "@/lib/messages-data"
import { cn } from "@/lib/utils"

export function MessageReplyQuote({
  reply,
  className,
}: {
  reply: MessageReplyPayload
  className?: string
}) {
  const preview = reply.unavailable
    ? "Message unavailable"
    : reply.preview || "Message unavailable"

  return (
    <div className={cn("mb-1.5 min-w-0", className)}>
      <div
        className={cn(
          "rounded-md px-2 py-1.5",
          "bg-foreground/12",
          "group-data-[variant=default]/bubble:bg-black/35",
          "group-data-[variant=muted]/bubble:bg-foreground/15",
        )}
      >
        <p className="truncate text-xs font-medium text-primary group-data-[variant=default]/bubble:text-primary-foreground/90">
          {reply.authorName}
        </p>
        <p
          className={cn(
            "truncate text-xs",
            reply.unavailable
              ? "text-muted-foreground italic group-data-[variant=default]/bubble:text-primary-foreground/60"
              : "text-foreground/80 group-data-[variant=default]/bubble:text-primary-foreground/75",
          )}
        >
          {preview}
        </p>
      </div>
    </div>
  )
}
