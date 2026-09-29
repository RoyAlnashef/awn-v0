"use client"

import { useEffect, useMemo, useState } from "react"
import { X } from "lucide-react"

import { PersonProfileDrawer } from "@/components/people/person-profile-drawer"
import {
  initials,
  type Availability,
  type Person,
  type TourCredit,
} from "@/lib/people-data"
import { getMemberById } from "@/lib/people/actions"
import type { MemberSharePayload } from "@/lib/messages-data"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

function memberShareToPerson(memberShare: MemberSharePayload): Person {
  const availability = (memberShare.availability ??
    "Between gigs") as Availability

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

  const card = (
    <div
      className={cn(
        "relative flex w-fit max-w-sm items-center gap-2.5 rounded-xl border border-border bg-popover p-3",
        isPreview && onRemove && "pr-9",
        variant === "message" &&
          "cursor-pointer shadow-sm transition-colors hover:border-primary/40",
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

      <Avatar className="size-8 shrink-0">
        <AvatarImage src={memberShare.avatar || undefined} alt="" />
        <AvatarFallback className="text-xs">
          {initials(memberShare.name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="truncate font-medium text-foreground">
          {memberShare.name}
        </span>
        <span className="truncate text-sm text-muted-foreground">
          {memberShare.role}
        </span>
      </div>
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
