"use client"

import { useState } from "react"
import { BadgeCheck, MapPin, MessageSquare } from "lucide-react"

import { availabilityConfig, initials, type Person } from "@/lib/people-data"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PersonProfileDrawer } from "@/components/people/person-profile-drawer"

export function PersonRow({ person }: { person: Person }) {
  const [connected, setConnected] = useState(person.connected)
  const [open, setOpen] = useState(false)
  const config = availabilityConfig[person.availability]

  return (
    <article className="relative flex flex-col gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 sm:flex-row sm:items-center">
      {/* Stretched trigger opens the profile drawer; action buttons use z-10. */}
      <button
        type="button"
        className="absolute inset-0 z-0 rounded-xl focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        aria-label={`View ${person.name}'s profile`}
        onClick={() => setOpen(true)}
      />

      <Avatar className="size-11 shrink-0">
        <AvatarImage src={person.avatar || undefined} alt="" />
        <AvatarFallback>{initials(person.name)}</AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-heading text-base font-semibold tracking-tight">
            {person.name}
          </h3>
          <Badge variant="outline">{person.department}</Badge>
        </div>
        <p className="text-sm text-foreground/90">{person.role}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0" />
            {person.homeBase}
          </span>
          <span className="flex items-center gap-1.5">
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
          <span className="flex items-center gap-1.5">
            <BadgeCheck className="size-3.5 shrink-0 text-primary" />
            <span className="font-medium text-foreground">{person.credits}</span>{" "}
            credits
          </span>
        </div>
      </div>

      <div className="relative z-10 flex shrink-0 items-center gap-2">
        <Button
          size="sm"
          variant={connected ? "outline" : "default"}
          aria-pressed={connected}
          onClick={() => setConnected((prev) => !prev)}
        >
          {connected ? "Connected" : "Connect"}
        </Button>
        <Button size="icon" variant="outline" aria-label={`Message ${person.name}`}>
          <MessageSquare className="size-4" />
        </Button>
      </div>

      <PersonProfileDrawer person={person} open={open} onOpenChange={setOpen} />
    </article>
  )
}
