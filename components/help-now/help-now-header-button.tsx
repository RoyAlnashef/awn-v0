"use client"

import * as React from "react"
import { usePathname } from "next/navigation"

import { HelpNowDialog } from "@/components/help-now/help-now-dialog"
import { HelpNowTriggerButton } from "@/components/help-now/help-now-trigger-button"
import { isNavRouteActive } from "@/lib/nav"
import { cn } from "@/lib/utils"

export function HelpNowHeaderButton({ className }: { className?: string }) {
  const pathname = usePathname()
  const [open, setOpen] = React.useState(false)

  if (isNavRouteActive(pathname, "/now")) return null

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
