"use client"

import * as React from "react"
import { Switch } from "@/components/ui/switch"

export function AvailabilityCard() {
  const [available, setAvailable] = React.useState(true)

  return (
    <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3 group-data-[collapsible=icon]:hidden">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="relative flex size-2.5">
            {available ? (
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75" />
            ) : null}
            <span
              className={
                "relative inline-flex size-2.5 rounded-full " +
                (available ? "bg-success" : "bg-muted-foreground")
              }
            />
          </span>
          <span className="text-sm font-medium">
            {available ? "Available" : "Off the grid"}
          </span>
        </div>
        <Switch
          checked={available}
          onCheckedChange={setAvailable}
          aria-label="Toggle availability"
        />
      </div>
      <p className="mt-2 text-xs leading-relaxed text-sidebar-foreground/60">
        {available
          ? "Your network can see you're open for work."
          : "You're hidden from availability search."}
      </p>
    </div>
  )
}
