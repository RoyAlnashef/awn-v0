"use client"

import useSWR from "swr"

import { listRooms, type RoomRecord } from "@/lib/rooms/actions"
import { roomsListKey } from "@/lib/rooms/swr-keys"

async function fetchRoomsList(): Promise<RoomRecord[]> {
  const result = await listRooms()
  if (!result.ok) throw new Error(result.error)
  return result.rooms
}

export function useRoomsList({ enabled = true }: { enabled?: boolean } = {}) {
  const swr = useSWR(enabled ? roomsListKey : null, fetchRoomsList, {
    dedupingInterval: 2000,
    revalidateOnFocus: true,
    refreshInterval: enabled ? 60_000 : 0,
  })

  return {
    ...swr,
    rooms: swr.data ?? [],
    isLoading: swr.isLoading && !swr.data,
  }
}

export { fetchRoomsList }
