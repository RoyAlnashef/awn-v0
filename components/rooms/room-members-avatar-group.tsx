"use client"

import { useMemo } from "react"

import { initials } from "@/lib/people-data"
import { useRoomMembersPreview } from "@/lib/rooms/hooks/use-room-members-preview"
import type { RoomMemberPreview } from "@/lib/rooms/actions"
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

function hashString(value: string) {
  let hash = 0
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return hash
}

function seededShuffle<T>(items: T[], seed: string) {
  const shuffled = [...items]
  let state = hashString(seed) || 1

  for (let i = shuffled.length - 1; i > 0; i--) {
    state = (state * 1664525 + 1013904223) | 0
    const j = Math.abs(state) % (i + 1)
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled
}

function pickPreviewMembers(
  members: RoomMemberPreview[],
  roomId: string,
  limit = 3,
) {
  return seededShuffle(members, roomId).slice(0, limit)
}

export function RoomMembersAvatarGroup({ roomId }: { roomId: string }) {
  const { members, totalCount, isLoading } = useRoomMembersPreview(roomId)

  const preview = useMemo(
    () => pickPreviewMembers(members, roomId),
    [members, roomId],
  )

  if (isLoading || totalCount === 0) return null

  const remaining = totalCount - preview.length

  return (
    <TooltipProvider>
      <AvatarGroup
        aria-label={`${totalCount} members in this group`}
        className="**:data-[slot=avatar]:ring-card"
      >
        {preview.map((member) => (
          <Tooltip key={member.id}>
            <TooltipTrigger
              render={
                <Avatar size="sm">
                  <AvatarImage src={member.avatarUrl} alt={member.name} />
                  <AvatarFallback>{initials(member.name)}</AvatarFallback>
                </Avatar>
              }
            />
            <TooltipContent>{member.name}</TooltipContent>
          </Tooltip>
        ))}
        {remaining > 0 ? (
          <AvatarGroupCount className="ring-card">+{remaining}</AvatarGroupCount>
        ) : null}
      </AvatarGroup>
    </TooltipProvider>
  )
}
