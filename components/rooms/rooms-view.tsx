"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Group } from "lucide-react"

import { type Room } from "@/lib/messages-data"
import { buildPopoutUrl } from "@/lib/popout"
import { cn } from "@/lib/utils"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Button } from "@/components/ui/button"
import { RoomsInbox } from "@/components/rooms/rooms-inbox"
import { RoomThread } from "@/components/rooms/room-thread"
import { useRooms } from "@/components/rooms/rooms-provider"
import { PopOutButton } from "@/components/popout-button"

export function RoomsView({
  title,
  description,
  initialRoomId,
  initialShareJobId,
  initialShareMemberId,
  canManageRooms = false,
  popout = false,
}: {
  title: string
  description?: string
  initialRoomId?: string
  initialShareJobId?: string
  initialShareMemberId?: string
  canManageRooms?: boolean
  popout?: boolean
}) {
  const router = useRouter()
  const { sortedRooms, rooms, toggleJoin, markRoomRead, getRoom, isLoading } =
    useRooms()
  const [active, setActive] = useState<Room | null>(null)
  const [composerShareJobId, setComposerShareJobId] = useState(
    initialShareJobId ?? "",
  )
  const [composerShareMemberId, setComposerShareMemberId] = useState(
    initialShareMemberId ?? "",
  )

  useEffect(() => {
    setComposerShareJobId(initialShareJobId ?? "")
  }, [initialShareJobId])

  useEffect(() => {
    setComposerShareMemberId(initialShareMemberId ?? "")
  }, [initialShareMemberId])

  function clearShareJobFromUrl() {
    setComposerShareJobId("")
    const params = new URLSearchParams(window.location.search)
    params.delete("shareJob")
    const query = params.toString()
    router.replace(query ? `?${query}` : window.location.pathname)
  }

  function clearShareMemberFromUrl() {
    setComposerShareMemberId("")
    const params = new URLSearchParams(window.location.search)
    params.delete("shareMember")
    const query = params.toString()
    router.replace(query ? `?${query}` : window.location.pathname)
  }

  function handleToggleJoin(id: string): Promise<void> {
    const room = getRoom(id)
    if (!room) return Promise.resolve()

    const joining = !room.joined
    const togglePromise = toggleJoin(id)

    if (joining) {
      setActive({ ...room, joined: true, unread: false })
    } else {
      setActive((prev) =>
        prev?.id === id ? { ...room, joined: false } : prev,
      )
    }

    return togglePromise
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
      <div
        className={cn(
          "flex items-start justify-between gap-4",
          activeRoom && "hidden md:flex",
        )}
      >
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
        <div className="flex shrink-0 items-center gap-2">
          {canManageRooms && !popout ? (
            <Button
              variant="outline"
              size="sm"
              className="hidden shrink-0 md:inline-flex"
              nativeButton={false}
              render={<Link href="/rooms/settings" />}
            >
              Manage Rooms
            </Button>
          ) : null}
          {!popout ? (
            <PopOutButton
              href={buildPopoutUrl(
                "/popout/rooms",
                activeRoom ? { room: activeRoom.id } : undefined,
              )}
              windowName={
                activeRoom ? `room-${activeRoom.id}` : "rooms-popout"
              }
              aria-label="Pop out Rooms"
            />
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
            isLoading={isLoading}
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
              initialShareJobId={composerShareJobId || undefined}
              initialShareMemberId={composerShareMemberId || undefined}
              onShareJobConsumed={clearShareJobFromUrl}
              onShareMemberConsumed={clearShareMemberFromUrl}
              onBack={() => setActive(null)}
              onJoin={() => handleToggleJoin(activeRoom.id)}
              onLeave={() => handleToggleJoin(activeRoom.id)}
            />
          ) : (
            <Empty className="flex-1 border-none">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Group />
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
