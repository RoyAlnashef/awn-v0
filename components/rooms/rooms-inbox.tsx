"use client"

import { useEffect, useMemo, useState, type MouseEvent } from "react"
import { BellOff, Search } from "lucide-react"

import { type Room } from "@/lib/messages-data"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Spinner } from "@/components/ui/spinner"
import { RoomActionsDropdown } from "@/components/rooms/room-actions-dropdown"
import { RoomsInboxSkeleton } from "@/components/rooms/rooms-inbox-skeleton"

type ToggleMuteResult = { ok: true } | { ok: false; error: string }

export function RoomsInbox({
  activeId,
  rooms,
  onSelectRoom,
  onToggleJoin,
  onToggleMute,
  onLeave,
  isLoading = false,
  className,
}: {
  activeId?: string
  rooms: Room[]
  onSelectRoom?: (room: Room) => void
  onToggleJoin?: (roomId: string) => void | Promise<void>
  onToggleMute?: (roomId: string) => Promise<ToggleMuteResult>
  onLeave?: (roomId: string) => void | Promise<void>
  isLoading?: boolean
  className?: string
}) {
  const [query, setQuery] = useState("")
  const [joiningRoomId, setJoiningRoomId] = useState<string | null>(null)

  useEffect(() => {
    if (!joiningRoomId) return
    const joined = rooms.some((r) => r.id === joiningRoomId && r.joined)
    if (joined) setJoiningRoomId(null)
  }, [rooms, joiningRoomId])

  useEffect(() => {
    if (!joiningRoomId) return
    const timeout = window.setTimeout(() => setJoiningRoomId(null), 15000)
    return () => window.clearTimeout(timeout)
  }, [joiningRoomId])

  async function handleJoinClick(e: MouseEvent, roomId: string) {
    e.stopPropagation()
    if (joiningRoomId || !onToggleJoin) return
    setJoiningRoomId(roomId)
    try {
      await onToggleJoin(roomId)
    } finally {
      setJoiningRoomId(null)
    }
  }

  const q = query.trim().toLowerCase()

  const filteredRooms = useMemo(() => {
    if (!q) return rooms
    return rooms.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q),
    )
  }, [q, rooms])

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col gap-0", className)}>
      <div className="flex shrink-0 flex-col gap-3 border-b p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search groups…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        {isLoading ? (
          <RoomsInboxSkeleton />
        ) : filteredRooms.length > 0 ? (
          <ul className="flex flex-col">
            {filteredRooms.map((room) => {
              const active = activeId === room.id
              const isJoining = joiningRoomId === room.id
              return (
                <li key={room.id}>
                  <div
                    className={cn(
                      "relative flex items-center gap-3 border-b px-4 py-3 last:border-b-0",
                      room.unread && room.joined && "bg-success/6",
                      active && "bg-accent",
                    )}
                  >
                    {room.unread && room.joined ? (
                      <span
                        aria-hidden="true"
                        className="absolute inset-y-0 left-0 w-0.5 bg-success"
                      />
                    ) : null}

                    <button
                      type="button"
                      onClick={() => onSelectRoom?.(room)}
                      aria-current={active ? "true" : undefined}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left transition-colors hover:opacity-90"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-xl leading-none">
                        {room.icon}
                      </span>
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <p
                          className={cn(
                            "min-w-0 truncate text-sm",
                            room.unread && room.joined
                              ? "font-semibold text-foreground"
                              : "font-medium text-foreground",
                          )}
                        >
                          {room.name}
                        </p>
                        {room.unread && room.joined && (room.unreadCount ?? 0) > 0 ? (
                          <span className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-success text-[10px] font-semibold text-success-foreground tabular-nums">
                            {room.unreadCount}
                          </span>
                        ) : null}
                      </div>
                    </button>

                    {room.joined ? (
                      <div className="flex shrink-0 items-center gap-1">
                        {room.muted ? (
                          <BellOff
                            className="size-3.5 shrink-0 text-muted-foreground/50"
                            aria-label="Muted"
                          />
                        ) : null}
                        <RoomActionsDropdown
                          room={room}
                          onToggleMute={onToggleMute}
                          onLeave={onLeave}
                        />
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0 min-w-14"
                        disabled={isJoining}
                        aria-busy={isJoining}
                        onClick={(e) => void handleJoinClick(e, room.id)}
                      >
                        {isJoining ? (
                          <Spinner className="size-3.5" />
                        ) : room.requiresJoinApproval && room.joinRequestPending ? (
                          "Cancel"
                        ) : room.requiresJoinApproval ? (
                          "Request"
                        ) : (
                          "Join"
                        )}
                      </Button>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            No groups match “{query}”.
          </p>
        )}
      </ScrollArea>
    </div>
  )
}
