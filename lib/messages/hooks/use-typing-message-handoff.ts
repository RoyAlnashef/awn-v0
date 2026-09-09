"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"

import { isUuid } from "@/lib/messages/format"
import type { ThreadMessage } from "@/lib/messages-data"
import { createClient } from "@/lib/supabase/client"

const TYPING_EXPIRE_MS = 3000
const AWAITING_MESSAGE_MS = 1000
const MORPH_COMPLETE_MS = 280

type TypingPayload = {
  userId: string
  typing: boolean
}

function typingChannelName(conversationId: string) {
  return `dm-typing:${conversationId}`
}

const EMPTY_IDS = new Set<string>()

function latestIncomingMessage(messages: ThreadMessage[]) {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    if (messages[index].from === "them") {
      return messages[index]
    }
  }
  return null
}

export function useTypingMessageHandoff(
  conversationId: string | null,
  currentUserId: string,
  messages: ThreadMessage[],
  newMessageIds: ReadonlySet<string>,
) {
  const [isTyping, setIsTyping] = useState(false)
  const [isAwaitingMessage, setIsAwaitingMessage] = useState(false)
  const [handoffMessageId, setHandoffMessageId] = useState<string | null>(null)
  const [skipEnterAnimationIds, setSkipEnterAnimationIds] =
    useState<ReadonlySet<string>>(EMPTY_IDS)

  const expireTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const awaitingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const morphTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const handoffMessageIdRef = useRef<string | null>(null)

  handoffMessageIdRef.current = handoffMessageId

  const clearExpireTimer = () => {
    if (expireTimerRef.current) {
      clearTimeout(expireTimerRef.current)
      expireTimerRef.current = null
    }
  }

  const clearAwaitingTimer = () => {
    if (awaitingTimerRef.current) {
      clearTimeout(awaitingTimerRef.current)
      awaitingTimerRef.current = null
    }
  }

  const clearMorphTimer = () => {
    if (morphTimerRef.current) {
      clearTimeout(morphTimerRef.current)
      morphTimerRef.current = null
    }
  }

  const scheduleExpire = () => {
    clearExpireTimer()
    expireTimerRef.current = setTimeout(() => {
      setIsTyping(false)
      expireTimerRef.current = null
    }, TYPING_EXPIRE_MS)
  }

  const startAwaitingMessage = () => {
    clearAwaitingTimer()
    setIsAwaitingMessage(true)
    awaitingTimerRef.current = setTimeout(() => {
      setIsAwaitingMessage(false)
      awaitingTimerRef.current = null
    }, AWAITING_MESSAGE_MS)
  }

  const beginHandoff = (messageId: string) => {
    clearAwaitingTimer()
    setIsAwaitingMessage(false)
    setIsTyping(false)
    setHandoffMessageId(messageId)
    setSkipEnterAnimationIds((current) => {
      if (current.has(messageId)) return current
      const next = new Set(current)
      next.add(messageId)
      return next
    })

    clearMorphTimer()
    morphTimerRef.current = setTimeout(() => {
      setHandoffMessageId(null)
      morphTimerRef.current = null
    }, MORPH_COMPLETE_MS)
  }

  useEffect(() => {
    if (!conversationId || !isUuid(conversationId)) {
      setIsTyping(false)
      setIsAwaitingMessage(false)
      setHandoffMessageId(null)
      setSkipEnterAnimationIds(EMPTY_IDS)
      return
    }

    const supabase = createClient()
    const channel = supabase.channel(typingChannelName(conversationId), {
      config: { broadcast: { self: false } },
    })

    channel
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        const { userId, typing } = payload as TypingPayload
        if (userId === currentUserId) return

        if (typing) {
          clearAwaitingTimer()
          setIsAwaitingMessage(false)
          setIsTyping(true)
          scheduleExpire()
          return
        }

        clearExpireTimer()
        setIsTyping(false)

        if (handoffMessageIdRef.current) return

        startAwaitingMessage()
      })
      .subscribe()

    return () => {
      clearExpireTimer()
      clearAwaitingTimer()
      clearMorphTimer()
      void supabase.removeChannel(channel)
      setIsTyping(false)
      setIsAwaitingMessage(false)
      setHandoffMessageId(null)
      setSkipEnterAnimationIds(EMPTY_IDS)
    }
  }, [conversationId, currentUserId])

  useLayoutEffect(() => {
    if (!isTyping && !isAwaitingMessage) return

    const incoming = latestIncomingMessage(messages)
    if (!incoming || !newMessageIds.has(incoming.id)) return
    if (handoffMessageIdRef.current === incoming.id) return

    beginHandoff(incoming.id)
  }, [isAwaitingMessage, isTyping, messages, newMessageIds])

  const handoffMessage =
    handoffMessageId != null
      ? (messages.find((message) => message.id === handoffMessageId) ?? null)
      : null

  const slotVisible =
    isTyping || isAwaitingMessage || handoffMessageId != null

  const showTyping = (isTyping || isAwaitingMessage) && handoffMessage == null

  return {
    slotVisible,
    showTyping,
    handoffMessage,
    excludedMessageId: handoffMessage?.id ?? null,
    isMorphing: handoffMessage != null,
    skipEnterAnimationIds,
  }
}
