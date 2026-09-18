"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Users } from "lucide-react"

import { type Room } from "@/lib/messages-data"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { RoomsInbox } from "@/components/rooms/rooms-inbox"
import { useRooms } from "@/components/rooms/rooms-provider"
import { isNavRouteActive } from "@/lib/nav"

export function Rooms() {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { sortedRooms, unreadCount, toggleJoin, toggleMute, markRoomRead, isLoading } =
    useRooms()

  if (isNavRouteActive(pathname, "/groups")) return null

  function navigateToRoom(roomId: string) {
    setOpen(false)
    router.push(`/groups?group=${roomId}`)
  }

  function handleToggleJoin(id: string): Promise<void> {
    const room = sortedRooms.find((r) => r.id === id)
    if (!room) return Promise.resolve()

    const joining = !room.joined
    const togglePromise = toggleJoin(id)

    if (joining) {
      return togglePromise.then(() => navigateToRoom(id))
    }

    return togglePromise
  }

  function handleSelectRoom(room: Room) {
    if (room.joined && room.unread) {
      markRoomRead(room.id)
    }

    navigateToRoom(room.id)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label={
              unreadCount > 0 ? `Groups, ${unreadCount} unread` : "Groups"
            }
          >
            <Users className="size-5" />
            {unreadCount > 0 ? (
              <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-success text-[10px] font-semibold text-success-foreground">
                {unreadCount}
              </span>
            ) : null}
          </Button>
        }
      />

      {open ? (
        <SheetContent
          side="right"
          className="inset-y-3! right-3! h-auto! w-full gap-0 overflow-hidden rounded-2xl border bg-card p-0 text-card-foreground sm:max-w-md"
        >
          <SheetHeader className="shrink-0 flex-row items-center justify-between gap-2 border-b p-4 pr-14">
            <div className="flex items-center gap-2">
              <SheetTitle>Groups</SheetTitle>
              {unreadCount > 0 ? (
                <span className="rounded-full bg-success/15 px-1.5 py-0.5 text-xs font-medium text-success">
                  {unreadCount} new
                </span>
              ) : null}
            </div>
          </SheetHeader>

          <RoomsInbox
            rooms={sortedRooms}
            isLoading={isLoading}
            onSelectRoom={handleSelectRoom}
            onToggleJoin={handleToggleJoin}
            onToggleMute={toggleMute}
            onLeave={handleToggleJoin}
          />
        </SheetContent>
      ) : null}
    </Sheet>
  )
}
