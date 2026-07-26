"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

import {
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScrollerScrollable,
} from "@/components/ui/message-scroller"
import { useIsMobile } from "@/hooks/use-mobile"

const DESKTOP_SCROLL_EDGE_THRESHOLD = 8
const MOBILE_SCROLL_EDGE_THRESHOLD = 48

type MessageAutoScrollContextValue = {
  onReadingHistoryStart: () => void
}

const MessageAutoScrollContext =
  createContext<MessageAutoScrollContextValue | null>(null)

export function useMessageAutoScroll() {
  const context = useContext(MessageAutoScrollContext)
  if (!context) {
    throw new Error(
      "useMessageAutoScroll must be used within MessageAutoScrollProvider",
    )
  }
  return context
}

function MessageAutoScrollController({
  onAllowChange,
}: {
  onAllowChange: (enabled: boolean) => void
}) {
  const scrollable = useMessageScrollerScrollable()

  useEffect(() => {
    const isAtBottom = !scrollable.end
    if (isAtBottom) {
      onAllowChange(true)
    }
  }, [onAllowChange, scrollable.end])

  return null
}

export function MessageAutoScrollViewport({
  ...props
}: React.ComponentProps<typeof MessageScrollerViewport>) {
  const { onReadingHistoryStart } = useMessageAutoScroll()

  return (
    <MessageScrollerViewport
      onReadingHistoryStart={onReadingHistoryStart}
      {...props}
    />
  )
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

  const onReadingHistoryStart = useCallback(() => {
    setAutoScrollEnabled(false)
  }, [])

  return (
    <MessageAutoScrollContext.Provider value={{ onReadingHistoryStart }}>
      <MessageScrollerProvider
        autoScroll={autoScrollEnabled}
        defaultScrollPosition={defaultScrollPosition}
        scrollEdgeThreshold={scrollEdgeThreshold}
      >
        <MessageAutoScrollController onAllowChange={setAutoScrollEnabled} />
        {children}
      </MessageScrollerProvider>
    </MessageAutoScrollContext.Provider>
  )
}
