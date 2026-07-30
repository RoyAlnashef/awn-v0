"use client"

import { useLayoutEffect, useRef, useState, type ReactNode } from "react"

import { MessageScrollerItem } from "@/components/ui/message-scroller"
import {
  Message,
  MessageAvatar,
  MessageContent,
} from "@/components/ui/message"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
import { TypingDots } from "@/components/messages/typing-indicator"
import { cn } from "@/lib/utils"

const SLOT_ENTER_MS = 280
const SLOT_EXIT_MS = 220

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
}

type TypingMessageHandoffSlotProps = {
  visible: boolean
  showTyping: boolean
  isMorphing: boolean
  name: string
  avatarUrl?: string | null
  messageContent?: ReactNode
  messageFooter?: ReactNode
}

export function TypingMessageHandoffSlot({
  visible,
  showTyping,
  isMorphing,
  name,
  avatarUrl,
  messageContent,
  messageFooter,
}: TypingMessageHandoffSlotProps) {
  const [mounted, setMounted] = useState(visible)
  const [phase, setPhase] = useState<"enter" | "exit" | "idle">(() =>
    visible ? "enter" : "idle",
  )
  const hadMessageLayerRef = useRef(false)
  const [typingLayerVisible, setTypingLayerVisible] = useState(showTyping)

  useLayoutEffect(() => {
    if (showTyping) {
      setTypingLayerVisible(true)
      return
    }

    if (isMorphing) {
      const timeout = window.setTimeout(() => {
        setTypingLayerVisible(false)
      }, 220)
      return () => window.clearTimeout(timeout)
    }

    setTypingLayerVisible(false)
  }, [isMorphing, showTyping])

  useLayoutEffect(() => {
    if (isMorphing || messageContent) {
      hadMessageLayerRef.current = true
    }
  }, [isMorphing, messageContent])

  useLayoutEffect(() => {
    if (visible) {
      setMounted(true)
      setPhase("enter")
      const timeout = window.setTimeout(() => {
        setPhase("idle")
      }, SLOT_ENTER_MS)
      return () => window.clearTimeout(timeout)
    }

    if (!mounted) return

    if (hadMessageLayerRef.current) {
      hadMessageLayerRef.current = false
      setMounted(false)
      setPhase("idle")
      return
    }

    setPhase("exit")
    const timeout = window.setTimeout(() => {
      setMounted(false)
      setPhase("idle")
    }, SLOT_EXIT_MS)

    return () => window.clearTimeout(timeout)
  }, [mounted, visible])

  if (!mounted) return null

  const showMessageLayer = isMorphing || Boolean(messageContent)

  return (
    <MessageScrollerItem
      messageId="typing-handoff"
      className={cn(
        phase === "enter" && "animate-message-enter [content-visibility:visible]",
        phase === "exit" &&
          !isMorphing &&
          "animate-message-exit [content-visibility:visible]",
      )}
    >
      <Message align="start" role="status" aria-live="polite">
        <span className="sr-only">
          {typingLayerVisible && !showMessageLayer
            ? `${name} is typing`
            : `${name} sent a message`}
        </span>
        <MessageAvatar>
          <Avatar className="size-8">
            <AvatarImage src={avatarUrl || undefined} alt="" />
            <AvatarFallback>{initials(name)}</AvatarFallback>
          </Avatar>
        </MessageAvatar>
        <MessageContent>
          <div className="typing-handoff-stack relative min-w-0 max-w-full">
            {typingLayerVisible ? (
              <Bubble
                variant="muted"
                align="start"
                className={cn(
                  "typing-handoff-layer max-w-full",
                  showMessageLayer && "typing-handoff-layer-exit",
                )}
              >
                <BubbleContent>
                  <TypingDots />
                </BubbleContent>
              </Bubble>
            ) : null}
            {showMessageLayer ? (
              <div
                className={cn(
                  "typing-handoff-layer min-w-0",
                  typingLayerVisible
                    ? "typing-handoff-layer-enter"
                    : "typing-handoff-layer-idle",
                )}
              >
                {messageContent}
              </div>
            ) : null}
          </div>
          {showMessageLayer ? messageFooter : null}
        </MessageContent>
      </Message>
    </MessageScrollerItem>
  )
}
