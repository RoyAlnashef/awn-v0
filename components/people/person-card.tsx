"use client"

import { useState } from "react"
import { BadgeCheck, Group, MapPin, MessageSquare, Share } from "lucide-react"

import {
  availabilityConfig,
  initials,
  type Person,
} from "@/lib/people-data"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PersonProfileDrawer } from "@/components/people/person-profile-drawer"
import { PersonShareToRoomsButton } from "@/components/people/person-share-to-rooms-button"
import { PersonShareToMessagesButton } from "@/components/people/person-share-to-messages-button"

function AvailabilityDot({ availability }: { availability: Person["availability"] }) {
  const config = availabilityConfig[availability]
  if (!config) return null
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
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
  const [followed, setFollowed] = useState(person.followed)
  const [open, setOpen] = useState(false)

  return (
    <article className="relative flex flex-col items-center gap-4 rounded-xl border border-border bg-card p-5 text-center transition-colors hover:border-primary/40">
      {/* Stretched trigger: whole card opens the profile drawer. Action
          buttons below sit above this via z-10 so they stay clickable. */}
      <button
        type="button"
        className="absolute inset-0 z-0 rounded-xl focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        aria-label={`View ${person.name}'s profile`}
        onClick={() => setOpen(true)}
      />

      <Badge variant="outline" className="self-center">
        {person.department}
      </Badge>

      <Avatar className="size-24 border-2 border-border">
        <AvatarImage src={person.avatar || undefined} alt="" />
        <AvatarFallback className="text-xl">{initials(person.name)}</AvatarFallback>
      </Avatar>

      <div className="flex flex-col items-center gap-0.5">
        <h3 className="font-heading text-lg font-semibold tracking-tight text-balance">
          {person.name}
        </h3>
        <p className="text-sm text-foreground/90">{person.role}</p>
      </div>

      <div className="flex flex-col items-center gap-1.5 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin className="size-3.5 shrink-0" />
          {person.homeBase}
        </span>
        <AvailabilityDot availability={person.availability} />
      </div>

      <div className="flex flex-wrap justify-center gap-1.5">
        {person.skills.map((skill) => (
          <Badge key={skill} variant="secondary" className="font-normal">
            {skill}
          </Badge>
        ))}
      </div>

      <div className="mt-auto flex w-full flex-col gap-4">
        <div className="flex items-center justify-center gap-4 border-t border-border pt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <BadgeCheck className="size-4 text-primary" />
            <span className="font-medium text-foreground">{person.credits}</span>{" "}
            credits
          </span>
          <span>
            <span className="font-medium text-foreground">{person.vouches}</span>{" "}
            vouches
          </span>
          <span>
            <span className="font-medium text-foreground">
              {person.yearsExperience}
            </span>{" "}
            yrs
          </span>
        </div>

        <div className="relative z-10 flex w-full min-w-0 items-center gap-2">
          <Button
            size="sm"
            variant={followed ? "outline" : "default"}
            className="min-w-0 flex-1 truncate"
            aria-pressed={followed}
            onClick={() => setFollowed((prev) => !prev)}
          >
            {followed ? "Following" : "Follow"}
          </Button>
          <PersonShareToMessagesButton person={person}>
            <Button
              size="icon"
              variant="outline"
              aria-label="Share as a message"
            >
              <Share className="size-4" />
            </Button>
          </PersonShareToMessagesButton>
          <PersonShareToRoomsButton person={person}>
            <Button
              size="icon"
              variant="outline"
              aria-label="Share to a room"
            >
              <Group className="size-4" />
            </Button>
          </PersonShareToRoomsButton>
          <Button size="icon" variant="outline" aria-label={`Message ${person.name}`}>
            <MessageSquare className="size-4" />
          </Button>
        </div>
      </div>

      <PersonProfileDrawer person={person} open={open} onOpenChange={setOpen} />
    </article>
  )
}
