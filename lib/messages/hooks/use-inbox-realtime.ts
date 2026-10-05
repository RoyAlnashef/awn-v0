"use client"

import { useEffect } from "react"
import { mutate as mutateSwr } from "swr"

import { useMessages } from "@/components/messages/messages-provider"
import {
  applyMessageDelete,
  isLatestMessage,
  previewAfterDelete,
} from "@/lib/messages/delete"
import { formatMessageTime } from "@/lib/messages/format"
import { mapRealtimeReply } from "@/lib/messages/reply"
import {
  archivedCountKey,
  inboxKey,
  threadKey,
  unreadCountKey,
} from "@/lib/messages/swr-keys"
import { notificationsKey } from "@/lib/notifications/swr-keys"
import { fetchThreadPage, type ThreadCache } from "@/lib/messages/thread-cache"
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
            shared_profile_id?: string | null
            member_share_snapshot?: Record<string, unknown> | null
            reply_to_message_id?: string | null
            reply_snapshot?: Record<string, unknown> | null
          }

          const isMine = row.sender_id === currentUser.id
          const isActive = row.conversation_id === activeConversationId
          const previewBody =
            row.member_share_snapshot && !row.body.trim()
              ? "Shared a member"
              : row.shared_profile_id && !row.body.trim()
                ? "Shared a member"
                : row.job_id && !row.body.trim()
                  ? "Shared a job"
                  : row.body

          bumpConversation(row.conversation_id, previewBody, {
            from: isMine ? "me" : "them",
            unread: !isMine && !isActive,
          })

          void mutateSwr(inboxKey(false))
          void mutateSwr(inboxKey(true))
          void mutateSwr(archivedCountKey)

          if (!isMine && isActive) {
            markConversationRead(row.conversation_id)
            void mutateSwr(notificationsKey)
          }

          if (!isMine) {
            void mutateSwr(unreadCountKey)
          }

          // Own sends in the open thread are handled by optimistic update in MessageThread.
          if (isMine) {
            if (!isActive) {
              void mutateSwr(threadKey(row.conversation_id), () =>
                fetchThreadPage(row.conversation_id),
              )
            }
            return
          }

          void mutateSwr(
            threadKey(row.conversation_id),
            (current: ThreadCache | undefined) => {
              if (!current) return current
              if (current.messages.some((message) => message.id === row.id)) {
                return current
              }

              if (row.job_id || row.shared_profile_id || row.member_share_snapshot) {
                return current
              }

              const replyTo = mapRealtimeReply(row)

              const incoming: ThreadMessage = {
                id: row.id,
                from: "them",
                text: row.body,
                time: formatMessageTime(row.created_at),
                createdAt: row.created_at,
                ...(replyTo ? { replyTo } : {}),
              }

              return {
                ...current,
                messages: [...current.messages, incoming],
              }
            },
            {
              revalidate: Boolean(
                row.job_id || row.shared_profile_id || row.member_share_snapshot,
              ),
            },
          )
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "dm_messages",
        },
        (payload) => {
          const row = payload.old as {
            id: string
            conversation_id: string
            sender_id: string
          }

          void mutateSwr(
            threadKey(row.conversation_id),
            (current: ThreadCache | undefined) => {
              if (!current) return current
              if (!current.messages.some((message) => message.id === row.id)) {
                return current
              }

              const wasLatest = isLatestMessage(current.messages, row.id)
              const previewInfo = wasLatest
                ? previewAfterDelete(current.messages, row.id)
                : null
              const next = applyMessageDelete(current, row.id)

              if (wasLatest && previewInfo) {
                if (!previewInfo.preview.trim()) {
                  void mutateSwr(inboxKey(false), undefined, { revalidate: true })
                  void mutateSwr(inboxKey(true), undefined, { revalidate: true })
                } else {
                  bumpConversation(row.conversation_id, previewInfo.preview, {
                    from: previewInfo.from,
                    unread: false,
                  })
                }
              }

              return next
            },
            { revalidate: false },
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
