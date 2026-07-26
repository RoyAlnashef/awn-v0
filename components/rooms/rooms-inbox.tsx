"use client"

import { useMemo, useState } from "react"
import { Check, Search } from "lucide-react"

import { type Room } from "@/lib/messages-data"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { RoomsInboxSkeleton } from "@/components/rooms/rooms-inbox-skeleton"

export function RoomsInbox({
  activeId,
  rooms,
  onSelectRoom,
  onToggleJoin,
  isLoading = false,
  className,
}: {
  activeId?: string
  rooms: Room[]
  onSelectRoom?: (room: Room) => void
  onToggleJoin?: (roomId: string) => void
  isLoading?: boolean
  className?: string
}) {
  const [query, setQuery] = useState("")

  const q = query.trim().toLowerCase()

  const filteredRooms = useMemo(() => {
    if (!q) return rooms
    return rooms.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        r.preview.toLowerCase().includes(q),
    )
  }, [q, rooms])

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col gap-0", className)}>
      <div className="flex shrink-0 flex-col gap-3 border-b p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search rooms…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="flex items-center justify-between px-4 pt-3 pb-1.5">
          <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Rooms
          </span>
          <span className="text-xs text-muted-foreground/80">
            {isLoading ? (
              <Skeleton className="inline-block h-3 w-4" />
            ) : (
              filteredRooms.length
            )}
          </span>
        </div>
        {isLoading ? (
          <RoomsInboxSkeleton />
        ) : filteredRooms.length > 0 ? (
          <ul className="flex flex-col">
            {filteredRooms.map((room) => {
              const active = activeId === room.id
              const Icon = room.icon
              return (
                <li key={room.id}>
                  <div
                    className={cn(
                      "relative flex items-center gap-3 border-b px-4 py-3 last:border-b-0",
                      room.unread && room.joined && "bg-primary/[0.06]",
                      active && "bg-accent",
                    )}
                  >
                    {room.unread && room.joined ? (
                      <span
                        aria-hidden="true"
                        className="absolute inset-y-0 left-0 w-0.5 bg-primary"
                      />
                    ) : null}

                    <button
                      type="button"
                      onClick={() => onSelectRoom?.(room)}
                      aria-current={active ? "true" : undefined}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left transition-colors hover:opacity-90"
                    >
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground/80">
                        <Icon className="size-5" />
                      </span>
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={cn(
                              "truncate text-sm",
                              room.unread && room.joined
                                ? "font-semibold text-foreground"
                                : "font-medium text-foreground",
                            )}
                          >
                            {room.name}
                          </p>
                          <span className="shrink-0 text-[11px] text-muted-foreground/80">
                            {room.time}
                          </span>
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          {room.preview}
                        </p>
                      </div>
                    </button>

                    <Button
                      size="sm"
                      variant={room.joined ? "outline" : "default"}
                      className="shrink-0"
                      aria-pressed={room.joined}
                      onClick={(e) => {
                        e.stopPropagation()
                        onToggleJoin?.(room.id)
                      }}
                    >
                      {room.joined ? (
                        <>
                          <Check className="size-3.5" />
                          Joined
                        </>
                      ) : (
                        "Join"
                      )}
                    </Button>
                  </div>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            No rooms match “{query}”.
          </p>
        )}
      </ScrollArea>
    </div>
  )
}
