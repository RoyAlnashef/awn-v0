"use client"

import { useRef, useState } from "react"
import {
  BadgeCheck,
  CalendarClock,
  ExternalLink,
  Flag,
  MessageSquare,
  Plane,
  Plus,
  Share2,
  Sparkles,
  ThumbsUp,
} from "lucide-react"

import {
  availabilityConfig,
  getPersonProfile,
  initials,
  type Person,
} from "@/lib/people-data"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"

/** Formats an ISO date-only string like "2026-08-01" → "Aug 1". */
function formatShortDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
      {children}
    </h3>
  )
}

export function PersonProfileDrawer({
  person,
  open,
  onOpenChange,
}: {
  person: Person
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const profile = getPersonProfile(person)
  const availability = availabilityConfig[person.availability]
  const [connected, setConnected] = useState(person.connected)
  // Focus the hero on open so the panel starts scrolled to the top rather than
  // jumping to the first focusable control deeper in the content.
  const heroRef = useRef<HTMLDivElement>(null)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        initialFocus={heroRef}
        className="inset-y-3! right-3! h-auto! w-full gap-0 overflow-hidden rounded-2xl border p-0 sm:max-w-md"
      >
        <SheetTitle className="sr-only">{person.name} profile</SheetTitle>
        <SheetDescription className="sr-only">
          Extended profile for {person.name}, {person.role}.
        </SheetDescription>

        {/* Hero */}
        <div ref={heroRef} tabIndex={-1} className="relative shrink-0 outline-none">
          <div className="h-24 bg-muted" />
          {availability ? (
            <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-background/70 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
              <span className="relative flex size-2">
                {availability.ping ? (
                  <span
                    className={cn(
                      "absolute inline-flex size-full animate-ping rounded-full opacity-75",
                      availability.dot,
                    )}
                  />
                ) : null}
                <span
                  className={cn(
                    "relative inline-flex size-2 rounded-full",
                    availability.dot,
                  )}
                />
              </span>
              {availability.label}
            </div>
          ) : null}

          <div className="px-6 pb-2">
            <Avatar className="-mt-10 size-20 ring-4 ring-popover">
              <AvatarImage src={person.avatar || undefined} alt="" />
              <AvatarFallback className="text-lg">
                {initials(person.name)}
              </AvatarFallback>
            </Avatar>

            <div className="mt-3 flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-heading text-xl font-semibold tracking-tight">
                  {person.name}
                </h2>
                {profile.verified ? (
                  <BadgeCheck className="size-5 text-primary" aria-label="Verified" />
                ) : null}
                {profile.founding ? (
                  <Badge className="gap-1 border-primary/30 bg-primary/15 text-primary">
                    <Sparkles className="size-3" />
                    Founding Member
                  </Badge>
                ) : null}
              </div>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                <span className="text-foreground/90">{person.role}</span>
                {profile.company ? (
                  <Badge variant="secondary" className="font-normal">
                    {profile.company}
                  </Badge>
                ) : null}
                <span>· {person.homeBase}</span>
              </div>
            </div>
          </div>
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col gap-6 px-6 py-5">
            {/* Meta chips */}
            <div className="flex flex-wrap gap-1.5">
              {person.venueTiers.map((tier) => (
                <Badge
                  key={tier}
                  className="border-primary/30 bg-primary/15 text-[11px] tracking-wide text-primary uppercase"
                >
                  {tier}
                </Badge>
              ))}
              <Badge variant="outline" className="gap-1 font-normal">
                <CalendarClock className="size-3" />
                Free {formatShortDate(person.availableFrom)}
              </Badge>
              {person.workAuth.map((auth) => (
                <Badge key={auth} variant="outline" className="gap-1 font-normal">
                  {auth === "Passport" ? <Plane className="size-3" /> : null}
                  {auth}
                </Badge>
              ))}
              <Badge variant="outline" className="font-normal">
                Member since {profile.memberSince}
              </Badge>
            </div>

            {/* Bio */}
            <p className="text-sm leading-relaxed text-foreground/90 text-pretty">
              {profile.bio}
            </p>

            {/* Tour credits */}
            <section className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <SectionLabel>Tour Credits</SectionLabel>
                <span className="text-xs text-muted-foreground">
                  {profile.tourCredits.length}
                </span>
              </div>
              <ul className="flex flex-col gap-2.5">
                {profile.tourCredits.map((credit) => (
                  <li
                    key={credit.title}
                    className="relative overflow-hidden rounded-xl border border-border bg-card p-4 pl-5"
                  >
                    <span
                      aria-hidden="true"
                      className="absolute inset-y-0 left-0 w-1 bg-primary"
                    />
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 flex-col gap-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-heading text-sm font-semibold">
                            {credit.title}
                          </span>
                          <span className="text-[10px] font-semibold tracking-wide text-primary uppercase">
                            {credit.venueTier}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {credit.role}
                        </span>
                        <Button
                          variant="outline"
                          size="xs"
                          className="mt-1 self-start"
                        >
                          <ThumbsUp />
                          Vouch for this
                        </Button>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {credit.years}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            {/* Skills */}
            <section className="flex flex-col gap-3">
              <SectionLabel>Skills</SectionLabel>
              <div className="flex flex-wrap gap-1.5">
                {person.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="font-normal">
                    {skill}
                  </Badge>
                ))}
              </div>
            </section>

            {/* Website */}
            <Button
              variant="outline"
              size="sm"
              className="self-start"
              render={
                <a
                  href={`https://${profile.website}`}
                  target="_blank"
                  rel="noreferrer"
                />
              }
            >
              <ExternalLink />
              {profile.website}
            </Button>
          </div>
        </ScrollArea>

        {/* Footer actions */}
        <div className="flex shrink-0 flex-col gap-2 border-t p-4">
          <div className="flex items-center gap-2">
            <Button className="flex-1">
              <MessageSquare />
              Message
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              aria-pressed={connected}
              onClick={() => setConnected((prev) => !prev)}
            >
              {connected ? (
                <>
                  <BadgeCheck />
                  Connected
                </>
              ) : (
                <>
                  <Plus />
                  Connect
                </>
              )}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="flex-1">
              View full profile
              <ExternalLink />
            </Button>
            <Button variant="ghost" size="sm" className="flex-1">
              <Share2 />
              Share
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mx-auto text-xs text-muted-foreground"
          >
            <Flag className="size-3" />
            Report member
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
