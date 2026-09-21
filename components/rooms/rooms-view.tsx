"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AnimatedIcon } from "@/components/icons/animated-icon"
import { UsersIcon } from "@/components/ui/users"

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
  const { sortedRooms, rooms, toggleJoin, toggleMute, markRoomRead, getRoom, isLoading } =
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

    const cancelingRequest =
      room.requiresJoinApproval && room.joinRequestPending
    const joining = !room.joined && !cancelingRequest
    const togglePromise = toggleJoin(id)

    return togglePromise.then(() => {
      const updated = getRoom(id) ?? room

      if (joining && !updated.requiresJoinApproval) {
        setActive({ ...updated, joined: true, unread: false })
        return
      }

      if (joining && updated.requiresJoinApproval) {
        setActive({
          ...updated,
          joinRequestPending: true,
        })
        return
      }

      if (cancelingRequest) {
        setActive({
          ...updated,
          joinRequestPending: false,
        })
        return
      }

      setActive((prev) =>
        prev?.id === id ? { ...updated, joined: false } : prev,
      )
    })
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
    ? (() => {
        const serverRoom = getRoom(active.id)
        if (!serverRoom) return active
        return {
          ...serverRoom,
          joined: serverRoom.joined || active.joined,
          unread: active.joined ? false : serverRoom.unread,
        }
      })()
    : null

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
      <div
        className={cn(
          "flex items-start justify-between gap-4",
          activeRoom && "hidden md:flex",
        )}
      >
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-h3 font-semibold tracking-tight">
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
              render={<Link href="/groups/settings" />}
            >
              Manage Groups
            </Button>
          ) : null}
          {!popout ? (
            <PopOutButton
              href={buildPopoutUrl(
                "/popout/groups",
                activeRoom ? { group: activeRoom.id } : undefined,
              )}
              windowName={
                activeRoom ? `group-${activeRoom.id}` : "groups-popout"
              }
              aria-label="Pop out Groups"
            />
          ) : null}
        </div>
      </div>

      <div className="flex min-h-0 min-w-0 flex-1 gap-4 overflow-hidden">
        <div
          className={cn(
            "flex w-full min-h-0 shrink-0 flex-col md:w-80 lg:w-96",
            activeRoom && "hidden md:flex",
          )}
        >
          <RoomsInbox
            activeId={activeRoom?.id}
            rooms={sortedRooms}
            isLoading={isLoading}
            onSelectRoom={selectRoom}
            onToggleJoin={handleToggleJoin}
            onToggleMute={toggleMute}
            onLeave={handleToggleJoin}
          />
        </div>

        <div
          className={cn(
            "min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card",
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
            />
          ) : (
            <Empty className="flex-1 border-none">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <AnimatedIcon icon={UsersIcon} size={24} />
                </EmptyMedia>
                <EmptyTitle>Community groups</EmptyTitle>
                <EmptyDescription>
                  Select a group to preview the conversation, or join to start
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
