"use client"

import { useState } from "react"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"

export function CreditRemovePopover({
  creditTitle,
  onConfirm,
  disabled = false,
}: {
  creditTitle: string
  onConfirm: () => void
  disabled?: boolean
}) {
  const [open, setOpen] = useState(false)

  function handleConfirm() {
    onConfirm()
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={disabled}
        render={
          <Button
            type="button"
            variant="ghost"
            size="xs"
            className="h-auto px-1.5 py-0.5 text-muted-foreground"
            disabled={disabled}
          >
            <X className="mr-1 size-3" />
            Remove
          </Button>
        }
      />
      <PopoverContent align="start" side="top" sideOffset={6} className="w-72">
        <PopoverHeader>
          <PopoverTitle>Remove credit?</PopoverTitle>
          <PopoverDescription>
            This will remove &ldquo;{creditTitle}&rdquo; from your timeline. This
            can&apos;t be undone.
          </PopoverDescription>
        </PopoverHeader>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleConfirm}
          >
            Remove
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
