"use client"

import { CornerUpLeft, Copy } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const actionHover = "hover:bg-(--message-reaction-hover)"

export function MessageActionSheet({
  onReply,
  onCopy,
  className,
}: {
  onReply?: () => void
  onCopy?: () => void
  className?: string
}) {
  return (
    <div className={cn("flex w-full min-w-36 flex-col items-stretch", className)}>
      {onReply ? (
        <Button
          type="button"
          variant="ghost"
          className={cn(
            "h-9 justify-start gap-2 rounded-lg px-2.5 text-sm font-normal",
            actionHover,
          )}
          onClick={onReply}
        >
          <CornerUpLeft className="size-4 shrink-0" />
          Reply
        </Button>
      ) : null}
      {onCopy ? (
        <Button
          type="button"
          variant="ghost"
          className={cn(
            "h-9 justify-start gap-2 rounded-lg px-2.5 text-sm font-normal",
            actionHover,
          )}
          onClick={onCopy}
        >
          <Copy className="size-4 shrink-0" />
          Copy Text
        </Button>
      ) : null}
    </div>
  )
}
