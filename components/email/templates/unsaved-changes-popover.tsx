"use client"

import type { RefObject } from "react"

import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

export function UnsavedChangesPopover({
  open,
  onOpenChange,
  anchor,
  onDiscard,
  onKeepEditing,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  anchor: RefObject<HTMLElement | null>
  onDiscard: () => void
  onKeepEditing: () => void
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverContent anchor={anchor} side="bottom" align="start" className="w-80">
        <PopoverHeader>
          <PopoverTitle>Discard changes?</PopoverTitle>
          <PopoverDescription>
            You have unsaved edits to this template. Discard them and return to
            the list?
          </PopoverDescription>
        </PopoverHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onKeepEditing}>
            Keep editing
          </Button>
          <Button type="button" variant="destructive" onClick={onDiscard}>
            Discard changes
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
