"use client"

import * as React from "react"

import { HelpNowDialog } from "@/components/help-now/help-now-dialog"
import { HelpNowTriggerButton } from "@/components/help-now/help-now-trigger-button"
import { cn } from "@/lib/utils"

export function HelpNowHeaderButton({ className }: { className?: string }) {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <HelpNowTriggerButton
        onClick={() => setOpen(true)}
        className={cn("hidden sm:inline-flex", className)}
      />
      <HelpNowDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
