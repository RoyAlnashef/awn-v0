"use client"

import { useEffect } from "react"
import { mutate as mutateSwr } from "swr"

import { formatMessageTime } from "@/lib/messages/format"
import {
  applyMessageDelete,
  isLatestMessage,
} from "@/lib/messages/delete"
import { mapRealtimeReply } from "@/lib/messages/reply"
import { roomThreadKey, roomsListKey, roomsUnreadCountKey } from "@/lib/rooms/swr-keys"
import type { RoomThreadCache } from "@/lib/rooms/thread-cache"
import type { ThreadMessage } from "@/lib/messages-data"
import { createClient } from "@/lib/supabase/client"

type UseRoomsRealtimeOptions = {
  currentUserId: string
  activeRoomId: string | null
  onNewMessage?: (roomId: string) => void
}

export function useRoomsRealtime({
  currentUserId,
  activeRoomId,
  onNewMessage,
}: UseRoomsRealtimeOptions) {
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel("rooms-global")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "room_messages",
        },
        (payload) => {
          const row = payload.new as {
            id: string
            room_id: string
            sender_id: string
            body: string
            created_at: string
            job_id?: string | null
            shared_profile_id?: string | null
            member_share_snapshot?: Record<string, unknown> | null
            reply_to_message_id?: string | null
            reply_snapshot?: Record<string, unknown> | null
          }

          const isMine = row.sender_id === currentUserId
          const isActive = row.room_id === activeRoomId
          const hasRichAttachment =
            Boolean(row.job_id) ||
            Boolean(row.shared_profile_id) ||
            Boolean(row.member_share_snapshot)

          // Own sends are handled by optimistic update + server action in the thread.
          if (!isMine) {
            void mutateSwr(
              roomThreadKey(row.room_id),
              (current: RoomThreadCache | undefined) => {
                if (!current) return current
                if (current.messages.some((m) => m.id === row.id)) {
                  return current
                }

                if (hasRichAttachment) {
                  return current
                }

                const priorFromSender = [...current.messages]
                  .reverse()
                  .find((message) => message.authorId === row.sender_id)

                const replyTo = mapRealtimeReply(row)

                const incoming: ThreadMessage = {
                  id: row.id,
                  from: "them",
                  text: row.body,
                  time: formatMessageTime(row.created_at),
                  createdAt: row.created_at,
                  authorId: row.sender_id,
                  author: priorFromSender?.author,
                  authorAvatarUrl: priorFromSender?.authorAvatarUrl,
                  ...(replyTo ? { replyTo } : {}),
                }

                return {
                  ...current,
                  messages: [...current.messages, incoming],
                }
              },
              { revalidate: hasRichAttachment },
            )
          }

          // Refresh the rooms list to update previews and unread counts
          void mutateSwr(roomsListKey)

          // Increment unread badge if the message is from someone else
          if (!isMine) {
            void mutateSwr(roomsUnreadCountKey)
            onNewMessage?.(row.room_id)
          }

          // If user is viewing the room and gets a message from others, mark read
          if (!isMine && isActive) {
            // The RoomThread component handles mark-read on view; no extra action needed here
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "room_messages",
        },
        (payload) => {
          const row = payload.old as {
            id: string
            room_id: string
            sender_id: string
          }

          void mutateSwr(
            roomThreadKey(row.room_id),
            (current: RoomThreadCache | undefined) => {
              if (!current) return current
              if (!current.messages.some((message) => message.id === row.id)) {
                return current
              }

              const wasLatest = isLatestMessage(current.messages, row.id)
              const next = applyMessageDelete(current, row.id)

              if (wasLatest) {
                void mutateSwr(roomsListKey)
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
  }, [activeRoomId, currentUserId, onNewMessage])
}

function RoomsRealtimeBridge({
  currentUserId,
  activeRoomId,
}: {
  currentUserId: string
  activeRoomId: string | null
}) {
  useRoomsRealtime({ currentUserId, activeRoomId })
  return null
}

export { RoomsRealtimeBridge }
