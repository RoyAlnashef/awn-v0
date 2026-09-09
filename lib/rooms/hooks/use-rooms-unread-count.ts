"use client"

import useSWR from "swr"

import { getRoomsUnreadCount } from "@/lib/rooms/actions"
import { roomsUnreadCountKey } from "@/lib/rooms/swr-keys"

async function fetchRoomsUnreadCount() {
  const result = await getRoomsUnreadCount()
  if (!result.ok) throw new Error(result.error)
  return result.count
}

export function useRoomsUnreadCount() {
  const { data, mutate } = useSWR(roomsUnreadCountKey, fetchRoomsUnreadCount, {
    dedupingInterval: 5000,
    revalidateOnFocus: true,
  })

  return {
    unreadCount: data ?? 0,
    mutateRoomsUnreadCount: mutate,
  }
}

export { fetchRoomsUnreadCount }
