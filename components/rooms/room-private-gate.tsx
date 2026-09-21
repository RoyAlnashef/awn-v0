"use client"

import { useState } from "react"

import type { Room } from "@/lib/messages-data"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

const NOTE_PREVIEW_LENGTH = 160

export function RoomPrivateGate({
  room,
  pending,
  onRequestJoin,
  onCancelRequest,
  className,
}: {
  room: Room
  pending?: boolean
  onRequestJoin?: () => void | Promise<void>
  onCancelRequest?: () => void | Promise<void>
  className?: string
}) {
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)

  const note = room.privateNote?.trim() ?? ""
  const showExpand = note.length > NOTE_PREVIEW_LENGTH
  const displayNote =
    expanded || !showExpand ? note : `${note.slice(0, NOTE_PREVIEW_LENGTH).trim()}…`

  async function handlePrimaryAction() {
    if (loading) return
    setLoading(true)
    try {
      if (room.joinRequestPending) {
        await onCancelRequest?.()
      } else {
        await onRequestJoin?.()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center gap-6 px-6 py-10 text-center",
        className,
      )}
    >
      <span className="flex size-16 items-center justify-center rounded-2xl bg-muted text-4xl leading-none">
        {room.icon}
      </span>

      <h2 className="max-w-md font-heading text-xl font-semibold text-foreground">
        {room.name}
      </h2>

      {note ? (
        <div className="max-w-md text-sm text-muted-foreground">
          <p className="text-pretty whitespace-pre-wrap">{displayNote}</p>
          {showExpand ? (
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="mt-1 text-sm font-medium text-primary hover:underline"
            >
              {expanded ? "See less" : "See more"}
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="flex w-full max-w-sm flex-col gap-3">
        <Button
          className="w-full"
          variant={room.joinRequestPending ? "outline" : "default"}
          disabled={loading || pending}
          onClick={() => void handlePrimaryAction()}
        >
          {loading || pending ? (
            <Spinner className="size-4" />
          ) : room.joinRequestPending ? (
            "Cancel request"
          ) : (
            "Request to join"
          )}
        </Button>
      </div>
    </div>
  )
}
