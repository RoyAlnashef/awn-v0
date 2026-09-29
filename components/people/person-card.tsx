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

function AvailabilityBadge({ availability }: { availability: Person["availability"] }) {
  const config = availabilityConfig[availability]
  if (!config) return null
  return (
    <span className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
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

export function PersonCard({
  person,
  checkInNote,
  className,
  onProfileOpenChange,
  onRequestProfile,
}: {
  person: Person
  /** Optional check-in note (map popover / check-in surfaces only). */
  checkInNote?: string | null
  className?: string
  onProfileOpenChange?: (open: boolean) => void
  /** When set, profile opens via parent (keeps flyout drawer enter animation). */
  onRequestProfile?: () => void
}) {
  const [open, setOpen] = useState(false)
  const availability = availabilityConfig[person.availability]
  const note = checkInNote?.trim()
  const usesExternalProfile = Boolean(onRequestProfile)

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    onProfileOpenChange?.(nextOpen)
  }

  function handleOpenProfile() {
    if (onRequestProfile) {
      onRequestProfile()
      return
    }
    setOpen(true)
  }

  return (
    <article
      className={cn(
        "relative flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-4 text-center transition-colors hover:border-primary/40",
        className,
      )}
    >
      <button
        type="button"
        className="absolute inset-0 z-0 rounded-xl focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        aria-label={`View ${person.name}'s profile`}
        onClick={handleOpenProfile}
      />

      <Avatar
        className={cn(
          "size-16 shrink-0 border-2",
          availability.avatarBorder,
        )}
      >
        <AvatarImage src={person.avatar || undefined} alt="" />
        <AvatarFallback className="text-base">{initials(person.name)}</AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-col items-center gap-4">
        <div className="flex flex-col items-center gap-0.5">
          <h3 className="font-heading text-base font-semibold tracking-tight text-balance">
            {person.name}
          </h3>
          <p className="text-sm text-muted-foreground">{person.role}</p>
        </div>
        {note ? (
          <p className="max-w-full px-1 text-sm text-foreground/90 text-pretty">
            {note}
          </p>
        ) : null}
        <AvailabilityBadge availability={person.availability} />
      </div>

      {usesExternalProfile ? null : (
        <PersonProfileDrawer
          person={person}
          open={open}
          onOpenChange={handleOpenChange}
        />
      )}
    </article>
  )
}
