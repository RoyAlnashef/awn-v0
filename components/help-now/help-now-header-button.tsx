"use client"

import * as React from "react"

import { HelpNowDialog } from "@/components/help-now/help-now-dialog"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function HelpNowHeaderButton({ className }: { className?: string }) {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className={cn(
          "hidden border-amber-600/40 text-amber-700 hover:bg-amber-600/10 hover:text-amber-800 sm:inline-flex dark:text-amber-500 dark:hover:text-amber-400",
          className,
        )}
        onClick={() => setOpen(true)}
      >
        <span
          className="size-1.5 shrink-0 rounded-full bg-amber-600 dark:bg-amber-500"
          aria-hidden
        />
        Help Now
      </Button>
      <HelpNowDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
