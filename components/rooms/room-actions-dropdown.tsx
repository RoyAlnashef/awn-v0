"use client"

import { useState, type MouseEvent } from "react"
import { BellOff, EllipsisVertical } from "lucide-react"
import { toast } from "sonner"

import { type Room } from "@/lib/messages-data"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type ToggleMuteResult = { ok: true } | { ok: false; error: string }

export function RoomActionsDropdown({
  room,
  onToggleMute,
  onLeave,
  disabled = false,
}: {
  room: Room
  onToggleMute?: (roomId: string) => Promise<ToggleMuteResult>
  onLeave?: (roomId: string) => void | Promise<void>
  disabled?: boolean
}) {
  const [pendingAction, setPendingAction] = useState<"mute" | "leave" | null>(
    null,
  )

  async function handleToggleMute(e: MouseEvent) {
    e.stopPropagation()
    if (pendingAction || !onToggleMute) return
    setPendingAction("mute")
    try {
      const result = await onToggleMute(room.id)
      if (!result.ok) {
        toast.error(result.error)
      }
    } finally {
      setPendingAction(null)
    }
  }

  async function handleLeave(e: MouseEvent) {
    e.stopPropagation()
    if (pendingAction || !onLeave) return
    setPendingAction("leave")
    try {
      await onLeave(room.id)
    } finally {
      setPendingAction(null)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-foreground"
            aria-label={`Actions for ${room.name}`}
            disabled={disabled || !!pendingAction}
            onClick={(e) => e.stopPropagation()}
          >
            <EllipsisVertical />
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={handleToggleMute}
          disabled={pendingAction === "mute"}
        >
          <BellOff />
          {room.muted ? "Unmute" : "Mute"}
        </DropdownMenuItem>
        {!room.isDefault ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLeave}
              disabled={!!pendingAction}
            >
              Leave
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
