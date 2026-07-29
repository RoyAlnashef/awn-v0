"use client"

import { useEffect } from "react"
import { mutate as mutateSwr } from "swr"

import { useMessages } from "@/components/messages/messages-provider"
import { formatMessageTime } from "@/lib/messages/format"
import { threadKey, unreadCountKey } from "@/lib/messages/swr-keys"
import type { ThreadCache } from "@/lib/messages/thread-cache"
import type { ThreadMessage } from "@/lib/messages-data"
import { createClient } from "@/lib/supabase/client"

export function useInboxRealtime() {
  const {
    currentUser,
    activeConversationId,
    bumpConversation,
    markConversationRead,
  } = useMessages()

  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel("dm-inbox-global")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "dm_messages",
        },
        (payload) => {
          const row = payload.new as {
            id: string
            conversation_id: string
            sender_id: string
            body: string
            created_at: string
            job_id?: string | null
          }

          const isMine = row.sender_id === currentUser.id
          const isActive = row.conversation_id === activeConversationId
          const previewBody =
            row.job_id && !row.body.trim()
              ? "Shared a job"
              : row.body

          bumpConversation(row.conversation_id, previewBody, {
            from: isMine ? "me" : "them",
            unread: !isMine && !isActive,
          })

          if (!isMine && isActive) {
            markConversationRead(row.conversation_id)
          }

          if (!isMine) {
            void mutateSwr(unreadCountKey)
          }

          void mutateSwr(
            threadKey(row.conversation_id),
            (current: ThreadCache | undefined) => {
              if (!current) return current
              if (current.messages.some((message) => message.id === row.id)) {
                return current
              }

              if (row.job_id) {
                return current
              }

              const incoming: ThreadMessage = {
                id: row.id,
                from: isMine ? "me" : "them",
                text: row.body,
                time: formatMessageTime(row.created_at),
                createdAt: row.created_at,
                readReceipt: isMine ? "delivered" : undefined,
              }

              return {
                ...current,
                messages: [...current.messages, incoming],
              }
            },
            { revalidate: row.job_id ? true : false },
          )
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [
    activeConversationId,
    bumpConversation,
    currentUser.id,
    markConversationRead,
  ])
}

function MessagesRealtimeBridge() {
  useInboxRealtime()
  return null
}

export { MessagesRealtimeBridge }
