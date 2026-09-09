"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { isUuid } from "@/lib/messages/format"
import { createClient } from "@/lib/supabase/client"

const TYPING_STOP_MS = 2000
const TYPING_EXPIRE_MS = 3000
const TYPING_KEEPALIVE_MS = 2000
const TYPING_HIDE_MS = 150

type TypingPayload = {
  userId: string
  typing: boolean
}

function typingChannelName(conversationId: string) {
  return `dm-typing:${conversationId}`
}

export function useTypingIndicator(
  conversationId: string | null,
  currentUserId: string,
) {
  const [isOtherTyping, setIsOtherTyping] = useState(false)
  const expireTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!conversationId || !isUuid(conversationId)) {
      setIsOtherTyping(false)
      return
    }

    const supabase = createClient()
    const channel = supabase.channel(typingChannelName(conversationId), {
      config: { broadcast: { self: false } },
    })

    const clearHideTimer = () => {
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current)
        hideTimerRef.current = null
      }
    }

    const hideTyping = () => {
      clearHideTimer()
      hideTimerRef.current = setTimeout(() => {
        setIsOtherTyping(false)
        hideTimerRef.current = null
      }, TYPING_HIDE_MS)
    }

    const scheduleExpire = () => {
      if (expireTimerRef.current) {
        clearTimeout(expireTimerRef.current)
      }

      expireTimerRef.current = setTimeout(() => {
        hideTyping()
        expireTimerRef.current = null
      }, TYPING_EXPIRE_MS)
    }

    channel
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        const { userId, typing } = payload as TypingPayload
        if (userId === currentUserId) return

        if (typing) {
          clearHideTimer()
          setIsOtherTyping(true)
          scheduleExpire()
          return
        }

        if (expireTimerRef.current) {
          clearTimeout(expireTimerRef.current)
          expireTimerRef.current = null
        }

        hideTyping()
      })
      .subscribe()

    return () => {
      if (expireTimerRef.current) {
        clearTimeout(expireTimerRef.current)
      }
      clearHideTimer()
      void supabase.removeChannel(channel)
      setIsOtherTyping(false)
    }
  }, [conversationId, currentUserId])

  return isOtherTyping
}

export function useTypingBroadcast(
  conversationId: string | null,
  currentUserId: string,
  draft: string,
  sending: boolean,
) {
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const keepAliveTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const channelRef = useRef<ReturnType<
    ReturnType<typeof createClient>["channel"]
  > | null>(null)
  const isTypingRef = useRef(false)

  const broadcast = useCallback(
    (typing: boolean) => {
      const channel = channelRef.current
      if (!channel) return
      if (!typing && !isTypingRef.current) return

      isTypingRef.current = typing
      void channel.send({
        type: "broadcast",
        event: "typing",
        payload: { userId: currentUserId, typing } satisfies TypingPayload,
      })
    },
    [currentUserId],
  )

  const stopTyping = useCallback(() => {
    if (stopTimerRef.current) {
      clearTimeout(stopTimerRef.current)
      stopTimerRef.current = null
    }

    if (keepAliveTimerRef.current) {
      clearInterval(keepAliveTimerRef.current)
      keepAliveTimerRef.current = null
    }

    broadcast(false)
  }, [broadcast])

  const startTyping = useCallback(() => {
    broadcast(true)

    if (keepAliveTimerRef.current) {
      clearInterval(keepAliveTimerRef.current)
    }

    keepAliveTimerRef.current = setInterval(() => {
      broadcast(true)
    }, TYPING_KEEPALIVE_MS)

    if (stopTimerRef.current) {
      clearTimeout(stopTimerRef.current)
    }

    stopTimerRef.current = setTimeout(() => {
      stopTyping()
    }, TYPING_STOP_MS)
  }, [broadcast, stopTyping])

  useEffect(() => {
    if (!conversationId || !isUuid(conversationId)) {
      channelRef.current = null
      return
    }

    const supabase = createClient()
    const channel = supabase
      .channel(typingChannelName(conversationId), {
        config: { broadcast: { self: false } },
      })
      .subscribe()

    channelRef.current = channel

    return () => {
      if (stopTimerRef.current) {
        clearTimeout(stopTimerRef.current)
        stopTimerRef.current = null
      }

      if (keepAliveTimerRef.current) {
        clearInterval(keepAliveTimerRef.current)
        keepAliveTimerRef.current = null
      }

      if (isTypingRef.current) {
        void channel.send({
          type: "broadcast",
          event: "typing",
          payload: { userId: currentUserId, typing: false },
        })
        isTypingRef.current = false
      }

      void supabase.removeChannel(channel)
      channelRef.current = null
    }
  }, [conversationId, currentUserId])

  useEffect(() => {
    if (!conversationId || !isUuid(conversationId)) return

    if (sending || !draft.trim()) {
      stopTyping()
      return
    }

    startTyping()
  }, [conversationId, draft, sending, startTyping, stopTyping])

  const onComposerBlur = useCallback(() => {
    stopTyping()
  }, [stopTyping])

  return { onComposerBlur }
}
