"use client"

import { useMemo, useState, type ReactElement } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

import { useRooms } from "@/components/rooms/rooms-provider"
import type { Job } from "@/lib/jobs-data"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function JobShareRoomPopover({
  job,
  children,
}: {
  job: Job
  children: ReactElement
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const { sortedRooms } = useRooms()

  const q = query.trim().toLowerCase()

  const joinedRooms = useMemo(
    () => sortedRooms.filter((room) => room.joined),
    [sortedRooms],
  )

  const filteredRooms = useMemo(() => {
    if (!q) return joinedRooms
    return joinedRooms.filter(
      (room) =>
        room.name.toLowerCase().includes(q) ||
        room.description.toLowerCase().includes(q),
    )
  }, [joinedRooms, q])

  const showSearch = joinedRooms.length > 5

  function handleSelectRoom(roomId: string) {
    setOpen(false)
    setQuery("")
    router.push(`/rooms?room=${roomId}&shareJob=${job.id}`)
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setQuery("")
      }}
    >
      <PopoverTrigger render={children} />
      <PopoverContent
        align="end"
        side="top"
        className="flex w-80 flex-col gap-0 overflow-hidden p-0"
      >
        {showSearch ? (
          <div className="shrink-0 border-b p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search rooms…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="pl-9"
                autoFocus
              />
            </div>
          </div>
        ) : null}

        <div className="max-h-72 min-h-0 overflow-y-auto overscroll-y-contain">
          {filteredRooms.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              {q
                ? "No rooms match your search."
                : "Join a room to share this job."}
            </p>
          ) : (
            <div className="py-1">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Rooms
                </span>
                <span className="text-xs text-muted-foreground/80">
                  {filteredRooms.length}
                </span>
              </div>
              <ul>
                {filteredRooms.map((room) => (
                  <li key={room.id}>
                    <button
                      type="button"
                      className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/60"
                      onClick={() => handleSelectRoom(room.id)}
                    >
                      <span
                        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-base"
                        aria-hidden
                      >
                        {room.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {room.name}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {room.description}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
