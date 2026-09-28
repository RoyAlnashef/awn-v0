"use client"

import * as React from "react"
import { MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
} from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { CHECK_IN_NOTE_MAX } from "@/lib/now/check-in-ui"
import { cn } from "@/lib/utils"

export function CheckInFormPopover({
  mode,
  open,
  onOpenChange,
  anchor,
  placeLabel,
  locationQuery,
  onLocationQueryChange,
  note,
  onNoteChange,
  pending,
  error,
  onSubmit,
}: {
  mode: "check-in" | "edit"
  open: boolean
  onOpenChange: (open: boolean) => void
  anchor: React.RefObject<HTMLElement | null>
  placeLabel: string
  locationQuery: string
  onLocationQueryChange: (value: string) => void
  note: string
  onNoteChange: (value: string) => void
  pending: boolean
  error: string | null
  onSubmit: () => void
}) {
  const noteLength = note.length

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverContent
        className="w-[min(22rem,calc(100vw-2rem))] gap-3 p-4"
        side="bottom"
        align="start"
        sideOffset={8}
        anchor={anchor}
      >
        <PopoverHeader>
          <PopoverTitle className="text-sm font-medium text-muted-foreground">
            {mode === "check-in" ? placeLabel : "Edit check-in"}
          </PopoverTitle>
        </PopoverHeader>

        {mode === "edit" ? (
          <InputGroup className="bg-background/90">
            <InputGroupAddon align="inline-start">
              <MapPin className="size-4" />
            </InputGroupAddon>
            <InputGroupInput
              value={locationQuery}
              onChange={(event) => onLocationQueryChange(event.target.value)}
              aria-label="Check-in location"
              placeholder="City or venue"
            />
          </InputGroup>
        ) : null}

        <div className="relative">
          <Textarea
            value={note}
            onChange={(event) =>
              onNoteChange(event.target.value.slice(0, CHECK_IN_NOTE_MAX))
            }
            placeholder="Add a note (optional)"
            className="min-h-24 bg-background/90 pr-14"
            aria-label="Check-in note"
          />
          <span
            className={cn(
              "pointer-events-none absolute right-3 bottom-2 text-xs tabular-nums",
              noteLength >= CHECK_IN_NOTE_MAX
                ? "text-destructive"
                : "text-muted-foreground",
            )}
          >
            {noteLength} / {CHECK_IN_NOTE_MAX}
          </span>
        </div>

        {mode === "edit" ? (
          <p className="text-xs text-muted-foreground">
            Any change resets your 24h window.
          </p>
        ) : null}

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            onClick={() => void onSubmit()}
            disabled={pending}
          >
            {pending
              ? "Saving…"
              : mode === "edit"
                ? "Update"
                : "Check in"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={pending}
          >
            Cancel
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
