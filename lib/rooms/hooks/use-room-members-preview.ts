"use client"

import useSWR from "swr"

import { isUuid } from "@/lib/messages/format"
import {
  getRoomMembersPreview,
  type RoomMemberPreview,
} from "@/lib/rooms/actions"
import { roomMembersPreviewKey } from "@/lib/rooms/swr-keys"

type RoomMembersPreviewCache = {
  members: RoomMemberPreview[]
  totalCount: number
}

async function fetchRoomMembersPreview(
  roomId: string,
): Promise<RoomMembersPreviewCache> {
  const result = await getRoomMembersPreview(roomId)
  if (!result.ok) throw new Error(result.error)
  return {
    members: result.members,
    totalCount: result.totalCount,
  }
}

export function useRoomMembersPreview(roomId: string | null) {
  const key =
    roomId && isUuid(roomId) ? roomMembersPreviewKey(roomId) : null

  const { data, isLoading } = useSWR(key, () => fetchRoomMembersPreview(roomId!), {
    dedupingInterval: 30_000,
    revalidateOnFocus: true,
  })

  return {
    members: data?.members ?? [],
    totalCount: data?.totalCount ?? 0,
    isLoading: isLoading && !data,
  }
}
