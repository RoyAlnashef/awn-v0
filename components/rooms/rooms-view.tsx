"use client"

import { useEffect, useState } from "react"
import { Hash } from "lucide-react"

import { type Room } from "@/lib/messages-data"
import { cn } from "@/lib/utils"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { RoomsInbox } from "@/components/rooms/rooms-inbox"
import { RoomThread } from "@/components/rooms/room-thread"
import { useRooms } from "@/components/rooms/rooms-provider"

export function RoomsView({
  title,
  description,
  initialRoomId,
}: {
  title: string
  description?: string
  initialRoomId?: string
}) {
  const { sortedRooms, rooms, toggleJoin, markRoomRead, getRoom } = useRooms()
  const [active, setActive] = useState<Room | null>(null)

  function handleToggleJoin(id: string) {
    const room = getRoom(id)
    if (!room) return

    const joining = !room.joined
    toggleJoin(id)

    if (joining) {
      setActive({ ...room, joined: true, unread: false })
    } else {
      setActive((prev) =>
        prev?.id === id ? { ...room, joined: false } : prev,
      )
    }
  }

  function selectRoom(room: Room) {
    if (room.joined && room.unread) {
      markRoomRead(room.id)
    }

    setActive(getRoom(room.id) ?? room)
  }

  useEffect(() => {
    if (!initialRoomId) return

    const room = rooms.find((r) => r.id === initialRoomId)
    if (!room) return

    if (room.joined && room.unread) {
      markRoomRead(initialRoomId)
    }

    setActive(room)
  }, [initialRoomId, rooms, markRoomRead])

  const activeRoom = active
    ? (getRoom(active.id) ?? active)
    : null

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {title}
          </h1>
          {description ? (
            <p className="text-sm text-muted-foreground text-pretty">
              {description}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 gap-4 overflow-hidden">
        <div
          className={cn(
            "flex w-full min-h-0 flex-col md:w-80 lg:w-96",
            activeRoom && "hidden md:flex",
          )}
        >
          <RoomsInbox
            activeId={activeRoom?.id}
            rooms={sortedRooms}
            onSelectRoom={selectRoom}
            onToggleJoin={handleToggleJoin}
          />
        </div>

        <div
          className={cn(
            "min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card",
            activeRoom ? "flex" : "hidden md:flex",
          )}
        >
          {activeRoom ? (
            <RoomThread
              key={activeRoom.id}
              room={activeRoom}
              onBack={() => setActive(null)}
              onJoin={() => handleToggleJoin(activeRoom.id)}
            />
          ) : (
            <Empty className="flex-1 border-none">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Hash />
                </EmptyMedia>
                <EmptyTitle>Community rooms</EmptyTitle>
                <EmptyDescription>
                  Select a room to preview the conversation, or join to start
                  chatting with the crew.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </div>
      </div>
    </div>
  )
}
