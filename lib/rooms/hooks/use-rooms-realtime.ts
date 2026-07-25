"use client"

import { useEffect } from "react"
import { mutate as mutateSwr } from "swr"

import { formatMessageTime } from "@/lib/messages/format"
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
          }

          const isMine = row.sender_id === currentUserId
          const isActive = row.room_id === activeRoomId

          // Append to the thread cache if it's loaded
          void mutateSwr(
            roomThreadKey(row.room_id),
            (current: RoomThreadCache | undefined) => {
              if (!current) return current
              // Deduplicate — optimistic send may have already appended it
              if (current.messages.some((m) => m.id === row.id)) {
                return current
              }

              const incoming: ThreadMessage = {
                id: row.id,
                from: isMine ? "me" : "them",
                text: row.body,
                time: formatMessageTime(row.created_at),
                createdAt: row.created_at,
              }

              return {
                ...current,
                messages: [...current.messages, incoming],
              }
            },
            { revalidate: false },
          )

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
