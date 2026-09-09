"use client"

import { useCallback } from "react"
import useSWR, { mutate as globalMutate } from "swr"

import { isUuid } from "@/lib/messages/format"
import { roomThreadKey } from "@/lib/rooms/swr-keys"
import {
  fetchRoomThreadPage,
  type RoomThreadCache,
} from "@/lib/rooms/thread-cache"

export function useRoomThread(roomId: string | null) {
  const key =
    roomId && isUuid(roomId) ? roomThreadKey(roomId) : null

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    key,
    () => fetchRoomThreadPage(roomId!),
    {
      dedupingInterval: 2000,
      revalidateOnFocus: false,
    },
  )

  const loadOlder = useCallback(async () => {
    if (!roomId || !data?.hasMore || !data.oldestCursor) return

    const older = await fetchRoomThreadPage(roomId, {
      before: data.oldestCursor,
    })

    await mutate(
      {
        messages: [...older.messages, ...data.messages],
        hasMore: older.hasMore,
        oldestCursor: older.messages[0]?.createdAt ?? data.oldestCursor,
      },
      { revalidate: false },
    )
  }, [roomId, data, mutate])

  return {
    messages: data?.messages ?? [],
    hasMore: data?.hasMore ?? false,
    isLoading: isLoading && !data,
    isValidating,
    loadOlder,
    mutate,
  }
}

export function prefetchRoomThread(roomId: string) {
  if (!isUuid(roomId)) return
  void globalMutate(roomThreadKey(roomId), () => fetchRoomThreadPage(roomId))
}

export type { RoomThreadCache }
