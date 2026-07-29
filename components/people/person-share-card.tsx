"use client"

import { useMemo, useState } from "react"
import { BadgeCheck, MapPin, X } from "lucide-react"

import { PersonProfileDrawer } from "@/components/people/person-profile-drawer"
import {
  availabilityConfig,
  initials,
  type Availability,
  type Person,
} from "@/lib/people-data"
import { getPersonById } from "@/lib/messages-data"
import type { MemberSharePayload } from "@/lib/messages-data"
import { cn } from "@/lib/utils"
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

function memberShareToPerson(memberShare: MemberSharePayload): Person {
  const existing = getPersonById(memberShare.id)
  if (existing) return existing

  const availability = (memberShare.availability ??
    "Between Tours") as Availability

  return {
    id: memberShare.id,
    name: memberShare.name,
    role: memberShare.role,
    department: memberShare.department ?? "Production",
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
    skills: [],
    avatar: memberShare.avatar,
    connected: false,
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
  const isPreview = variant === "preview"
  const person = useMemo(() => memberShareToPerson(memberShare), [memberShare])

  const card = (
    <Attachment
      className={cn(
        "max-w-sm",
        variant === "message" &&
          "cursor-pointer rounded-xl border-border bg-card shadow-sm hover:border-primary/40",
        className,
      )}
      size={isPreview ? "sm" : "default"}
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
      <AttachmentMedia variant="image" className="size-10">
        <Avatar className="size-full">
          <AvatarImage src={memberShare.avatar || undefined} alt="" />
          <AvatarFallback>{initials(memberShare.name)}</AvatarFallback>
        </Avatar>
      </AttachmentMedia>
      <AttachmentContent>
        {memberShare.department ? (
          <Badge variant="secondary" className="text-[10px]">
            {memberShare.department}
          </Badge>
        ) : null}
        <AttachmentTitle className="font-heading text-sm">
          {memberShare.name}
        </AttachmentTitle>
        <AttachmentDescription>{memberShare.role}</AttachmentDescription>
        <div className="mt-1 flex flex-col gap-0.5 text-xs text-muted-foreground">
          {memberShare.homeBase ? (
            <span className="flex items-center gap-1">
              <MapPin className="size-3 shrink-0" />
              <span className="truncate">{memberShare.homeBase}</span>
            </span>
          ) : null}
          <AvailabilityDot availability={memberShare.availability} />
          {memberShare.credits != null ||
          memberShare.vouches != null ||
          memberShare.yearsExperience != null ? (
            <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              {memberShare.credits != null ? (
                <span className="inline-flex items-center gap-1">
                  <BadgeCheck className="size-3 shrink-0 text-primary" />
                  {memberShare.credits} credits
                </span>
              ) : null}
              {memberShare.vouches != null ? (
                <span>{memberShare.vouches} vouches</span>
              ) : null}
              {memberShare.yearsExperience != null ? (
                <span>{memberShare.yearsExperience} yrs</span>
              ) : null}
            </span>
          ) : null}
        </div>
      </AttachmentContent>
      {isPreview && onRemove ? (
        <AttachmentActions>
          <AttachmentAction
            aria-label="Remove member attachment"
            onClick={(event) => {
              event.stopPropagation()
              onRemove()
            }}
          >
            <X className="size-3.5" />
          </AttachmentAction>
        </AttachmentActions>
      ) : null}
    </Attachment>
  )

  return (
    <>
      {card}
      {variant === "message" ? (
        <PersonProfileDrawer
          person={person}
          open={detailOpen}
          onOpenChange={setDetailOpen}
        />
      ) : null}
    </>
  )
}
