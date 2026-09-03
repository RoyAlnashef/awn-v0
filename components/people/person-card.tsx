"use client"

import { useEffect, useState, useTransition } from "react"
import { toast } from "sonner"
import { Users, MapPin, MessagesSquare, Share } from "lucide-react"

import {
  availabilityConfig,
  initials,
  type Person,
} from "@/lib/people-data"
import { toggleConnection } from "@/lib/people/actions"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
  const [connected, setConnected] = useState(person.followed)
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setConnected(person.followed)
  }, [person.followed, person.id])

  function handleConnectionToggle(event: React.MouseEvent) {
    event.stopPropagation()
    startTransition(async () => {
      const result = await toggleConnection(person.id, connected)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      setConnected(result.connected)
    })
  }

  return (
    <article className="relative flex flex-col gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40">
      <button
        type="button"
        className="absolute inset-0 z-0 rounded-xl focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        aria-label={`View ${person.name}'s profile`}
        onClick={() => setOpen(true)}
      />

      <div className="flex gap-3">
        <Avatar className="size-14 shrink-0 border-2 border-border">
          <AvatarImage src={person.avatar || undefined} alt="" />
          <AvatarFallback className="text-sm">{initials(person.name)}</AvatarFallback>
        </Avatar>

        <div className="flex min-w-0 flex-1 flex-col items-start gap-1.5 text-left">
          <div className="flex flex-col gap-0.5">
            <h3 className="font-heading text-base font-semibold tracking-tight text-balance">
              {person.name}
            </h3>
            <p className="text-sm text-foreground/90">{person.role}</p>
          </div>

          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            {person.homeBase ? (
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5 shrink-0" />
                {person.homeBase}
              </span>
            ) : null}
            <AvailabilityDot availability={person.availability} />
          </div>
        </div>
      </div>

      <div
        className="relative z-10 mt-auto flex w-full min-w-0 items-center gap-2 border-t border-border pt-4"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <PersonShareToMessagesButton person={person}>
          <Button size="icon" variant="outline" aria-label="Share as a message">
            <Share className="size-4" />
          </Button>
        </PersonShareToMessagesButton>
        <PersonShareToRoomsButton person={person}>
          <Button size="icon" variant="outline" aria-label="Share to a group">
            <Users className="size-4" />
          </Button>
        </PersonShareToRoomsButton>
        <Button size="icon" variant="outline" aria-label={`Message ${person.name}`}>
          <MessagesSquare className="size-4" />
        </Button>
        <Button
          size="sm"
          variant={connected ? "outline" : "default"}
          className="ml-auto shrink-0"
          aria-pressed={connected}
          disabled={isPending}
          onClick={handleConnectionToggle}
        >
          {connected ? "Connected" : "Connect"}
        </Button>
      </div>

      <PersonProfileDrawer person={person} open={open} onOpenChange={setOpen} />
    </article>
  )
}
