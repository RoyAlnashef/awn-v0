"use client"

import { useEffect, useMemo, useState } from "react"
import { BadgeCheck, MapPin, X } from "lucide-react"

import { PersonProfileDrawer } from "@/components/people/person-profile-drawer"
import {
  availabilityConfig,
  initials,
  type Availability,
  type Person,
  type TourCredit,
} from "@/lib/people-data"
import { getMemberById } from "@/lib/people/actions"
import type { MemberSharePayload } from "@/lib/messages-data"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

function memberShareToPerson(memberShare: MemberSharePayload): Person {
  const availability = (memberShare.availability ??
    "Between Tours") as Availability

  return {
    id: memberShare.id,
    name: memberShare.name,
    role: memberShare.role,
    department: memberShare.department ?? "",
    homeBase: memberShare.homeBase ?? "",
    city: memberShare.homeBase?.split(",")[0]?.trim() ?? "",
    availability,
    availableFrom: "",
    availableTo: "",
    venueTiers: [],
    workAuth: [],
    yearsExperience: memberShare.yearsExperience ?? 0,
    credits: memberShare.credits ?? 0,
    vouches: memberShare.vouches ?? 0,
    topTours: [],
    skills: memberShare.skills ?? [],
    avatar: memberShare.avatar,
    followed: false,
  }
}

function AvailabilityDot({ availability }: { availability?: string }) {
  if (!availability) return null
  const config = availabilityConfig[availability as Availability]
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

export function PersonShareCard({
  memberShare,
  variant = "message",
  className,
  onRemove,
}: {
  memberShare: MemberSharePayload
  variant?: "preview" | "message"
  className?: string
  onRemove?: () => void
}) {
  const [detailOpen, setDetailOpen] = useState(false)
  const [resolvedPerson, setResolvedPerson] = useState<Person | null>(null)
  const [resolvedTourCredits, setResolvedTourCredits] = useState<TourCredit[]>([])
  const isPreview = variant === "preview"
  const fallbackPerson = useMemo(
    () => memberShareToPerson(memberShare),
    [memberShare],
  )
  const person = resolvedPerson ?? fallbackPerson

  useEffect(() => {
    if (!detailOpen) return

    void getMemberById(memberShare.id).then((result) => {
      if (!result.ok) return
      setResolvedPerson(result.person)
      setResolvedTourCredits(result.tourCredits)
    })
  }, [detailOpen, memberShare.id])

  const hasStats =
    memberShare.credits != null ||
    memberShare.vouches != null ||
    memberShare.yearsExperience != null

  const card = (
    <div
      className={cn(
        "relative flex w-full max-w-70 flex-col items-center gap-3 rounded-xl border border-border bg-card p-4 text-center",
        variant === "message" &&
          "max-w-full cursor-pointer shadow-sm transition-colors hover:border-primary/40",
        className,
      )}
      onClick={variant === "message" ? () => setDetailOpen(true) : undefined}
      onKeyDown={
        variant === "message"
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault()
                setDetailOpen(true)
              }
            }
          : undefined
      }
      role={variant === "message" ? "button" : undefined}
      tabIndex={variant === "message" ? 0 : undefined}
    >
      {isPreview && onRemove ? (
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="absolute top-2 right-2 z-10"
          aria-label="Remove member attachment"
          onClick={(event) => {
            event.stopPropagation()
            onRemove()
          }}
        >
          <X className="size-3.5" />
        </Button>
      ) : null}

      {memberShare.department ? (
        <Badge variant="outline" className="self-center">
          {memberShare.department}
        </Badge>
      ) : null}

      <Avatar
        className={cn(
          "border-2 border-border",
          isPreview ? "size-16" : "size-20",
        )}
      >
        <AvatarImage src={memberShare.avatar || undefined} alt="" />
        <AvatarFallback className={isPreview ? "text-base" : "text-lg"}>
          {initials(memberShare.name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-col items-center gap-0.5">
        <h3
          className={cn(
            "font-heading font-semibold tracking-tight text-balance",
            isPreview ? "text-base" : "text-lg",
          )}
        >
          {memberShare.name}
        </h3>
        <p className="text-sm text-foreground/90">{memberShare.role}</p>
      </div>

      {memberShare.homeBase || memberShare.availability ? (
        <div className="flex flex-col items-center gap-1.5 text-sm text-muted-foreground">
          {memberShare.homeBase ? (
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5 shrink-0" />
              {memberShare.homeBase}
            </span>
          ) : null}
          <AvailabilityDot availability={memberShare.availability} />
        </div>
      ) : null}

      {person.skills.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-1.5">
          {person.skills.map((skill) => (
            <Badge key={skill} variant="secondary" className="font-normal">
              {skill}
            </Badge>
          ))}
        </div>
      ) : null}

      {hasStats ? (
        <div className="flex w-full items-center justify-center gap-4 border-t border-border pt-3 text-xs text-muted-foreground">
          {memberShare.credits != null ? (
            <span className="flex items-center gap-1.5">
              <BadgeCheck className="size-4 text-primary" />
              <span className="font-medium text-foreground">
                {memberShare.credits}
              </span>{" "}
              credits
            </span>
          ) : null}
          {memberShare.vouches != null ? (
            <span>
              <span className="font-medium text-foreground">
                {memberShare.vouches}
              </span>{" "}
              vouches
            </span>
          ) : null}
          {memberShare.yearsExperience != null ? (
            <span>
              <span className="font-medium text-foreground">
                {memberShare.yearsExperience}
              </span>{" "}
              yrs
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  )

  return (
    <>
      {card}
      {variant === "message" ? (
        <PersonProfileDrawer
          person={person}
          tourCredits={resolvedTourCredits}
          open={detailOpen}
          onOpenChange={setDetailOpen}
        />
      ) : null}
    </>
  )
}
