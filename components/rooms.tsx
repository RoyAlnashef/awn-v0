"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Group } from "lucide-react"

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

export function Rooms() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const { sortedRooms, unreadCount, toggleJoin, markRoomRead, isLoading } =
    useRooms()

  function navigateToRoom(roomId: string) {
    setOpen(false)
    router.push(`/rooms?room=${roomId}`)
  }

  function handleToggleJoin(id: string) {
    const room = sortedRooms.find((r) => r.id === id)
    if (!room) return

    const joining = !room.joined
    toggleJoin(id)

    if (joining) {
      navigateToRoom(id)
    }
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
              unreadCount > 0 ? `Rooms, ${unreadCount} unread` : "Rooms"
            }
          >
            <Group className="size-5" />
            {unreadCount > 0 ? (
              <span className="absolute top-1 right-1 flex min-w-4 items-center justify-center rounded-full bg-success px-1 text-[10px] font-semibold text-success-foreground ring-2 ring-background">
                {unreadCount}
              </span>
            ) : null}
          </Button>
        }
      />

      {open ? (
        <SheetContent
          side="right"
          className="inset-y-3! right-3! h-auto! w-full gap-0 overflow-hidden rounded-2xl border p-0 sm:max-w-md"
        >
          <SheetHeader className="shrink-0 flex-row items-center justify-between gap-2 border-b p-4 pr-14">
            <div className="flex items-center gap-2">
              <SheetTitle>Rooms</SheetTitle>
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
          />
        </SheetContent>
      ) : null}
    </Sheet>
  )
}
