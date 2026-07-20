"use client"

import { useMemo, useState } from "react"
import { Hash } from "lucide-react"

import {
  GENERAL_ROOM_ID,
  rooms as initialRooms,
  sortRoomsForInbox,
  type Room,
} from "@/lib/messages-data"
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

export function RoomsView({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  const [rooms, setRooms] = useState<Room[]>(initialRooms)
  const [joinOrder, setJoinOrder] = useState<string[]>(() =>
    initialRooms.filter((r) => r.joined).map((r) => r.id),
  )
  const [active, setActive] = useState<Room | null>(null)

  const sortedRooms = useMemo(
    () => sortRoomsForInbox(rooms, joinOrder),
    [rooms, joinOrder],
  )

  function toggleJoin(id: string) {
    const room = rooms.find((r) => r.id === id)
    if (!room) return
    const joining = !room.joined

    const updatedRoom: Room = joining
      ? { ...room, joined: true, unread: false }
      : { ...room, joined: false }

    setRooms((prev) =>
      prev.map((r) => (r.id === id ? updatedRoom : r)),
    )
    setJoinOrder((order) => {
      if (joining) {
        const without = order.filter((roomId) => roomId !== id)
        const general = without.filter((roomId) => roomId === GENERAL_ROOM_ID)
        const rest = without.filter((roomId) => roomId !== GENERAL_ROOM_ID)
        return [...general, id, ...rest]
      }
      return order.filter((roomId) => roomId !== id)
    })

    if (joining) {
      setActive(updatedRoom)
    } else {
      setActive((prev) => (prev?.id === id ? updatedRoom : prev))
    }
  }

  function selectRoom(room: Room) {
    const next = room.joined && room.unread ? { ...room, unread: false } : room
    setActive(next)
    if (room.joined && room.unread) {
      setRooms((prev) =>
        prev.map((r) => (r.id === room.id ? { ...r, unread: false } : r)),
      )
    }
  }

  const activeRoom = active
    ? (rooms.find((r) => r.id === active.id) ?? active)
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
            onToggleJoin={toggleJoin}
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
              onJoin={() => toggleJoin(activeRoom.id)}
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
