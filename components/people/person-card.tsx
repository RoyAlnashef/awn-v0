"use client"

import { useState } from "react"

import {
  availabilityConfig,
  initials,
  type Person,
} from "@/lib/people-data"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PersonProfileDrawer } from "@/components/people/person-profile-drawer"

function AvailabilityDot({ availability }: { availability: Person["availability"] }) {
  const config = availabilityConfig[availability]
  if (!config) return null
  return (
    <span className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
      <span className="relative flex size-2">
        {config.ping ? (
          <span
            className={cn(
              "absolute inline-flex size-full animate-ping rounded-full opacity-75",
              config.dot,
            )}
          />
        ) : null}
        <span className={cn("relative inline-flex size-2 rounded-full", config.dot)} />
      </span>
      {config.label}
    </span>
  )
}

export function PersonCard({ person }: { person: Person }) {
  const [open, setOpen] = useState(false)

  return (
    <article className="relative flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-4 text-center transition-colors hover:border-primary/40">
      <button
        type="button"
        className="absolute inset-0 z-0 rounded-xl focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        aria-label={`View ${person.name}'s profile`}
        onClick={() => setOpen(true)}
      />

      <Avatar className="size-16 shrink-0 border-2 border-border">
        <AvatarImage src={person.avatar || undefined} alt="" />
        <AvatarFallback className="text-base">{initials(person.name)}</AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-col items-center gap-1">
        <h3 className="font-heading text-base font-semibold tracking-tight text-balance">
          {person.name}
        </h3>
        <p className="text-sm text-foreground/90">{person.role}</p>
        <AvailabilityDot availability={person.availability} />
      </div>

      <PersonProfileDrawer person={person} open={open} onOpenChange={setOpen} />
    </article>
  )
}
