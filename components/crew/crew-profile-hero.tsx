"use client"

import { BadgeCheck, Sparkles } from "lucide-react"

import { CrewResumeButton } from "@/components/crew/crew-resume-button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  availabilityConfig,
  getPersonProfile,
  initials,
  type Person,
  type TourCredit,
} from "@/lib/people-data"
import { cn } from "@/lib/utils"

function AvailabilityBadge({
  availability,
  className,
}: {
  availability: Person["availability"]
  className?: string
}) {
  const config = availabilityConfig[availability]

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full bg-background/70 px-2.5 py-1 text-xs font-medium backdrop-blur-sm",
        className,
      )}
    >
      <span className="relative flex size-2">
        {config.ping ? (
          <span
            className={cn(
              "absolute inline-flex size-full animate-ping rounded-full opacity-75",
              config.dot,
            )}
          />
        ) : null}
        <span
          className={cn("relative inline-flex size-2 rounded-full", config.dot)}
        />
      </span>
      {config.label}
    </div>
  )
}

export function CrewProfileHero({
  person,
  tourCredits,
  onPrintResume,
}: {
  person: Person
  tourCredits: TourCredit[]
  onPrintResume?: () => void
}) {
  const profile = getPersonProfile(person, tourCredits)
  const availability = availabilityConfig[person.availability]
  const handle = person.handle ?? ""

  return (
    <section className="relative w-full">
      <div className="relative aspect-21/9 w-full max-h-[480px] min-h-48 sm:min-h-56 lg:min-h-64">
        {person.banner ? (
          <img
            src={person.banner}
            alt=""
            draggable={false}
            className="absolute inset-0 size-full object-cover"
            style={{
              objectPosition: `center ${person.bannerPositionY ?? 50}%`,
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-muted" />
        )}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-[85%] bg-linear-to-b from-transparent via-background/55 via-45% to-background lg:hidden"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 hidden bg-linear-to-b from-background/15 via-background/50 to-background lg:block"
        />

      </div>

      <div className="relative mx-auto w-full max-w-6xl px-6 sm:px-8">
        <div className="flex flex-col items-center gap-4 pb-4 lg:flex-row lg:items-end lg:justify-between lg:gap-6 lg:pb-10">
          <div className="flex w-full flex-col items-center gap-4 lg:flex-row lg:items-end lg:gap-5">
            <Avatar
              className={cn(
                "-mt-12 size-24 shrink-0 ring-4 sm:-mt-14 sm:size-28 lg:-mt-16 lg:size-32",
                availability.avatarRing,
              )}
            >
              <AvatarImage src={person.avatar || undefined} alt="" />
              <AvatarFallback className="text-xl">
                {initials(person.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col items-center gap-1.5 text-center lg:items-start lg:pb-1 lg:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                <h1 className="font-heading text-2xl font-semibold tracking-tight sm:text-3xl">
                  {person.name}
                </h1>
                {profile.verified ? (
                  <BadgeCheck
                    className="size-5 text-primary"
                    aria-label="Verified"
                  />
                ) : null}
                {profile.founding ? (
                  <Badge className="gap-1 border-primary/30 bg-primary/15 text-primary">
                    <Sparkles className="size-3" />
                    Founding Member
                  </Badge>
                ) : null}
              </div>
              <p className="text-sm text-muted-foreground">
                {[person.role, person.homeBase].filter(Boolean).join(" · ")}
              </p>
              {person.availability ? (
                <AvailabilityBadge
                  availability={person.availability}
                  className="mt-2 lg:hidden"
                />
              ) : null}
            </div>
          </div>

          <div className="hidden shrink-0 items-center gap-3 lg:flex">
            {person.availability ? (
              <AvailabilityBadge availability={person.availability} />
            ) : null}
            {handle ? (
              <CrewResumeButton
                handle={handle}
                hasResume={Boolean(person.hasResume)}
                onPrintResume={onPrintResume}
              />
            ) : null}
          </div>
        </div>
      </div>
    </section>
  )
}
