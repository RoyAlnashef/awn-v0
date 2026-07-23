"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowDownIcon } from "lucide-react"

import {
  MessageScrollerButton,
  useMessageScrollerScrollable,
} from "@/components/ui/message-scroller"
import type { ThreadMessage } from "@/lib/messages-data"
import { cn } from "@/lib/utils"

function countIncomingAfterAnchor(
  messages: ThreadMessage[],
  anchorId: string | null,
) {
  if (!anchorId) return 0

  const anchorIndex = messages.findIndex((message) => message.id === anchorId)
  const startIndex = anchorIndex === -1 ? 0 : anchorIndex + 1

  return messages
    .slice(startIndex)
    .filter((message) => message.from === "them").length
}

export function MessageThreadScrollButton({
  messages,
}: {
  messages: ThreadMessage[]
}) {
  const scrollable = useMessageScrollerScrollable()
  const prevAtBottomRef = useRef(true)
  const anchorMessageIdRef = useRef<string | null>(null)
  const [unreadBelow, setUnreadBelow] = useState(0)

  useEffect(() => {
    const isAtBottom = !scrollable.end
    const wasAtBottom = prevAtBottomRef.current
    const lastMessageId = messages.at(-1)?.id ?? null

    prevAtBottomRef.current = isAtBottom

    if (isAtBottom) {
      anchorMessageIdRef.current = lastMessageId
      setUnreadBelow(0)
      return
    }

    if (wasAtBottom && !isAtBottom && lastMessageId) {
      anchorMessageIdRef.current = lastMessageId
    }

    if (!anchorMessageIdRef.current && lastMessageId) {
      anchorMessageIdRef.current = lastMessageId
    }

    setUnreadBelow(
      countIncomingAfterAnchor(messages, anchorMessageIdRef.current),
    )
  }, [messages, scrollable.end])

  return (
    <MessageScrollerButton
      variant="secondary"
      size={unreadBelow > 0 ? "sm" : "icon-sm"}
      className={cn(
        unreadBelow > 0 && "h-8 gap-1.5 rounded-full px-3 shadow-sm",
      )}
    >
      <ArrowDownIcon className="size-4 shrink-0" />
      {unreadBelow > 0 ? (
        <span className="text-xs font-medium">{unreadBelow} New</span>
      ) : (
        <span className="sr-only">Scroll to end</span>
      )}
    </MessageScrollerButton>
  )
}
