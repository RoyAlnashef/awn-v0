"use client"

import { HelpNowTriggerButton } from "@/components/help-now/help-now-trigger-button"
import { helpNowCalloutDescription } from "@/lib/jobs/help-now"
import { urgentDotStyles } from "@/lib/jobs/format"
import { cn } from "@/lib/utils"

export function HelpNowPageCallout({
  onOpen,
  className,
}: {
  onOpen: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        "w-full min-w-0 self-start rounded-lg border border-amber-600/30 bg-amber-600/5 px-4 py-3 sm:max-w-sm sm:w-auto",
        className,
      )}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="flex items-center gap-2 font-medium text-foreground">
            <span
              className={cn("size-2 shrink-0 rounded-full", urgentDotStyles)}
              aria-hidden
            />
            Help Now
          </p>
          <p className="text-body-sm text-pretty text-muted-foreground">
            {helpNowCalloutDescription}
          </p>
        </div>
        <HelpNowTriggerButton onClick={onOpen} className="shrink-0" />
      </div>
    </div>
  )
}
