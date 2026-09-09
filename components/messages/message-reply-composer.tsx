"use client"

import { X } from "lucide-react"

import type { MessageReplyPayload } from "@/lib/messages-data"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function MessageReplyComposer({
  reply,
  onDismiss,
  className,
}: {
  reply: MessageReplyPayload
  onDismiss: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        "mb-2 flex items-start gap-2 rounded-xl border border-border/60 bg-muted/60 px-3 py-2",
        className,
      )}
    >
      <div className="min-w-0 flex-1 border-l-2 border-primary pl-2.5">
        <p className="truncate text-xs font-medium text-primary">
          Replying to {reply.authorName}
        </p>
        <p className="truncate text-sm text-muted-foreground">
          {reply.unavailable ? "Message unavailable" : reply.preview}
        </p>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        className="shrink-0 text-muted-foreground"
        aria-label="Cancel reply"
        onClick={onDismiss}
      >
        <X className="size-4" />
      </Button>
    </div>
  )
}
