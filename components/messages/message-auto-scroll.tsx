"use client"

import { useEffect, useState, type ReactNode } from "react"

import {
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScrollerScrollable,
} from "@/components/ui/message-scroller"
import { useIsMobile } from "@/hooks/use-mobile"

const DESKTOP_SCROLL_EDGE_THRESHOLD = 8
const MOBILE_SCROLL_EDGE_THRESHOLD = 48

function MessageAutoScrollController({
  onAllowChange,
}: {
  onAllowChange: (enabled: boolean) => void
}) {
  const scrollable = useMessageScrollerScrollable()

  useEffect(() => {
    const isAtBottom = !scrollable.end
    onAllowChange(isAtBottom)
  }, [onAllowChange, scrollable.end])

  return null
}

export function MessageAutoScrollViewport({
  ...props
}: React.ComponentProps<typeof MessageScrollerViewport>) {
  return <MessageScrollerViewport {...props} />
}

export function MessageAutoScrollProvider({
  children,
  defaultScrollPosition,
}: {
  children: ReactNode
  defaultScrollPosition?: "start" | "end" | "last-anchor"
}) {
  const isMobile = useIsMobile()
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true)
  const scrollEdgeThreshold = isMobile
    ? MOBILE_SCROLL_EDGE_THRESHOLD
    : DESKTOP_SCROLL_EDGE_THRESHOLD

  return (
    <MessageScrollerProvider
      autoScroll={autoScrollEnabled}
      defaultScrollPosition={defaultScrollPosition}
      scrollEdgeThreshold={scrollEdgeThreshold}
    >
      <MessageAutoScrollController onAllowChange={setAutoScrollEnabled} />
      {children}
    </MessageScrollerProvider>
  )
}
