"use client"

import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DrawerClose } from "@/components/ui/drawer"

export const FLYOUT_DRAWER_CONTENT_CLASS = cn(
  "[--drawer-inset:--spacing(3)] gap-0 overflow-hidden rounded-2xl p-0",
  "data-[swipe-axis=x]:w-full data-[swipe-axis=x]:sm:max-w-md",
)

export function FlyoutDrawerClose() {
  return (
    <DrawerClose
      render={
        <Button variant="ghost" className="absolute top-4 right-4" size="icon-sm">
          <XIcon />
          <span className="sr-only">Close</span>
        </Button>
      }
    />
  )
}
