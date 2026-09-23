"use client"

import { useRooms } from "@/components/rooms/rooms-provider"
import { RoomsInbox } from "@/components/rooms/rooms-inbox"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

export function ChooseGroupsCard({ className }: { className?: string }) {
  const { rooms, sortedRooms, isLoading, toggleJoin, toggleMute } = useRooms()

  const joinedCount = rooms.filter((r) => r.joined).length
  const availableCount = rooms.length

  return (
    <Card className={cn("flex min-h-0 flex-col", className)}>
      <CardHeader>
        <CardTitle>Choose your groups</CardTitle>
        <CardAction>
          <span className="text-sm text-muted-foreground tabular-nums">
            {joinedCount}/{availableCount}
          </span>
        </CardAction>
      </CardHeader>
      <CardContent className="max-h-120 overflow-y-auto overscroll-contain p-0">
        <RoomsInbox
          embedded
          showSearch={false}
          rooms={sortedRooms}
          onToggleJoin={toggleJoin}
          onToggleMute={toggleMute}
          onLeave={toggleJoin}
          isLoading={isLoading}
          className="flex-none"
        />
      </CardContent>
    </Card>
  )
}
