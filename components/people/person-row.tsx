"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { BadgeCheck, Group, MapPin, MessageSquare, Share } from "lucide-react"

import { availabilityConfig, initials, type Person } from "@/lib/people-data"
import { toggleConnection } from "@/lib/people/actions"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PersonProfileDrawer } from "@/components/people/person-profile-drawer"
import { PersonShareToRoomsButton } from "@/components/people/person-share-to-rooms-button"
import { PersonShareToMessagesButton } from "@/components/people/person-share-to-messages-button"

export function PersonRow({ person }: { person: Person }) {
  const [followed, setFollowed] = useState(person.followed)
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const config = availabilityConfig[person.availability]

  function handleConnectionToggle() {
    startTransition(async () => {
      const result = await toggleConnection(person.id, followed)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      setFollowed(result.connected)
    })
  }

  return (
    <article className="relative flex flex-col gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 sm:flex-row sm:items-center">
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
          {person.department ? (
            <Badge variant="outline">{person.department}</Badge>
          ) : null}
        </div>
        <p className="text-sm text-foreground/90">{person.role}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {person.homeBase ? (
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5 shrink-0" />
              {person.homeBase}
            </span>
          ) : null}
          {config ? (
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
          ) : null}
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
          variant={followed ? "outline" : "default"}
          aria-pressed={followed}
          disabled={isPending}
          onClick={handleConnectionToggle}
        >
          {followed ? "Following" : "Follow"}
        </Button>
        <Button size="icon" variant="outline" aria-label={`Message ${person.name}`}>
          <MessageSquare className="size-4" />
        </Button>
        <PersonShareToMessagesButton person={person}>
          <Button size="icon" variant="outline" aria-label="Share as a message">
            <Share className="size-4" />
          </Button>
        </PersonShareToMessagesButton>
        <PersonShareToRoomsButton person={person}>
          <Button size="icon" variant="outline" aria-label="Share to a room">
            <Group className="size-4" />
          </Button>
        </PersonShareToRoomsButton>
      </div>

      <PersonProfileDrawer person={person} open={open} onOpenChange={setOpen} />
    </article>
  )
}
