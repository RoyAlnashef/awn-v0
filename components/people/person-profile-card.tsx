"use client"

import { useRef, useState, type RefObject } from "react"
import {
  BadgeCheck,
  CalendarClock,
  ExternalLink,
  Flag,
  Group,
  MessageSquare,
  Plane,
  Plus,
  Share,
  Sparkles,
  ThumbsUp,
} from "lucide-react"

import {
  availabilityConfig,
  getPersonProfile,
  initials,
  type Person,
  type TourCredit,
} from "@/lib/people-data"
import { personToSharePayload } from "@/lib/messages/member-share"
import { cn } from "@/lib/utils"
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShareToMessagesDrawer } from "@/components/messages/share-to-messages-flyout"
import { ShareToRoomsDrawer } from "@/components/rooms/share-to-rooms-flyout"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

/** Formats an ISO date-only string like "2026-08-01" → "Aug 1". */
function formatShortDate(iso: string) {
  if (!iso) return "—"
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

function PreviewTooltip({
  children,
  preview,
}: {
  children: React.ReactNode
  preview: boolean
}) {
  if (!preview) return children

  return (
    <Tooltip>
      <TooltipTrigger render={<span className="contents">{children}</span>} />
      <TooltipContent>Preview only</TooltipContent>
    </Tooltip>
  )
}

export function PersonProfileCard({
  person,
  tourCredits: tourCreditsOverride,
  mode,
  online,
  className,
  heroRef: heroRefProp,
  onMessage,
}: {
  person: Person
  tourCredits?: TourCredit[]
  mode: "interactive" | "preview"
  online?: boolean
  className?: string
  heroRef?: RefObject<HTMLDivElement | null>
  onMessage?: () => void
}) {
  const profile = getPersonProfile(person)
  const resolvedTourCredits = tourCreditsOverride ?? profile.tourCredits
  const availability = availabilityConfig[person.availability]
  const isOnline = online ?? false
  const isPreview = mode === "preview"
  const internalHeroRef = useRef<HTMLDivElement>(null)
  const heroRef = heroRefProp ?? internalHeroRef
  const [followed, setFollowed] = useState(person.followed)
  const [shareOpen, setShareOpen] = useState(false)
  const [shareRoomOpen, setShareRoomOpen] = useState(false)

  const website = person.website ?? profile.website

  return (
    <TooltipProvider delay={400}>
      <div className={cn("flex h-full min-h-0 flex-col overflow-hidden bg-popover text-popover-foreground", className)}>
        {/* Hero */}
        <div ref={heroRef} tabIndex={-1} className="relative shrink-0 outline-none">
          {person.banner ? (
            <img
              src={person.banner}
              alt=""
              draggable={false}
              className="h-24 w-full object-cover"
              style={{
                objectPosition: `center ${person.bannerPositionY ?? 50}%`,
              }}
            />
          ) : (
            <div className="h-24 bg-muted" />
          )}
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
              <AvatarBadge online={isOnline} className="size-3.5" />
            </Avatar>

            <div className="mt-3 flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-heading text-xl font-semibold tracking-tight">
                  {person.name || "Your name"}
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
                {person.role ? (
                  <span className="text-foreground/90">{person.role}</span>
                ) : null}
                {profile.company ? (
                  <Badge variant="secondary" className="font-normal">
                    {profile.company}
                  </Badge>
                ) : null}
                {person.homeBase ? <span>· {person.homeBase}</span> : null}
              </div>
            </div>
          </div>
        </div>

        <ScrollArea className="min-h-0 flex-1 overflow-hidden">
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
              {person.availableFrom ? (
                <Badge variant="outline" className="gap-1 font-normal">
                  <CalendarClock className="size-3" />
                  Free {formatShortDate(person.availableFrom)}
                </Badge>
              ) : null}
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
            {profile.bio ? (
              <p className="text-sm leading-relaxed text-foreground/90 text-pretty">
                {profile.bio}
              </p>
            ) : null}

            {/* Tour credits */}
            {resolvedTourCredits.length > 0 ? (
              <section className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <SectionLabel>Tour Credits</SectionLabel>
                  <span className="text-xs text-muted-foreground">
                    {resolvedTourCredits.length}
                  </span>
                </div>
                <ul className="flex flex-col gap-2.5">
                  {resolvedTourCredits.map((credit, index) => (
                    <li
                      key={`${credit.title}-${index}`}
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
                          <PreviewTooltip preview={isPreview}>
                            <Button
                              variant="outline"
                              size="xs"
                              className="mt-1 self-start"
                              disabled={isPreview}
                              aria-disabled={isPreview}
                            >
                              <ThumbsUp />
                              Vouch for this
                            </Button>
                          </PreviewTooltip>
                        </div>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {credit.years}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            {/* Skills */}
            {person.skills.length > 0 ? (
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
            ) : null}

            {/* Website */}
            {website ? (
              <PreviewTooltip preview={isPreview}>
                <Button
                  variant="outline"
                  size="sm"
                  className="self-start"
                  disabled={isPreview}
                  aria-disabled={isPreview}
                  nativeButton={false}
                  render={
                    isPreview ? (
                      <span />
                    ) : (
                      <a
                        href={`https://${website}`}
                        target="_blank"
                        rel="noreferrer"
                      />
                    )
                  }
                >
                  <ExternalLink />
                  {website}
                </Button>
              </PreviewTooltip>
            ) : null}
          </div>
        </ScrollArea>

        {/* Footer actions */}
        <div className="relative z-10 flex shrink-0 flex-col gap-2 border-t bg-popover p-4">
          <div className="flex items-center gap-2">
            <PreviewTooltip preview={isPreview}>
              <Button
                variant="outline"
                size="icon"
                aria-label={followed ? "Following" : "Follow"}
                aria-pressed={followed}
                disabled={isPreview}
                aria-disabled={isPreview}
                onClick={() => setFollowed((prev) => !prev)}
              >
                {followed ? <BadgeCheck /> : <Plus />}
              </Button>
            </PreviewTooltip>
            <PreviewTooltip preview={isPreview}>
              <Button
                className="min-w-0 flex-1 shrink"
                disabled={isPreview}
                aria-disabled={isPreview}
                onClick={onMessage}
              >
                <MessageSquare />
                Message
              </Button>
            </PreviewTooltip>
            <PreviewTooltip preview={isPreview}>
              <Button
                variant="ghost"
                size="icon"
                aria-label="View full profile"
                disabled={isPreview}
                aria-disabled={isPreview}
              >
                <ExternalLink />
              </Button>
            </PreviewTooltip>
            <PreviewTooltip preview={isPreview}>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Share as a message"
                disabled={isPreview}
                aria-disabled={isPreview}
                onClick={() => setShareOpen(true)}
              >
                <Share className="size-4" />
              </Button>
            </PreviewTooltip>
            <PreviewTooltip preview={isPreview}>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Share to a room"
                disabled={isPreview}
                aria-disabled={isPreview}
                onClick={() => setShareRoomOpen(true)}
              >
                <Group className="size-4" />
              </Button>
            </PreviewTooltip>
          </div>
          <PreviewTooltip preview={isPreview}>
            <Button
              variant="ghost"
              size="sm"
              className="mx-auto text-xs text-muted-foreground"
              disabled={isPreview}
              aria-disabled={isPreview}
            >
              <Flag className="size-3" />
              Report member
            </Button>
          </PreviewTooltip>
        </div>

        {!isPreview ? (
          <>
            <ShareToMessagesDrawer
              open={shareOpen}
              onOpenChange={setShareOpen}
              shareMember={person.id}
              shareLabel={personToSharePayload(person).name}
            />

            <ShareToRoomsDrawer
              open={shareRoomOpen}
              onOpenChange={setShareRoomOpen}
              shareMember={person.id}
              shareLabel={personToSharePayload(person).name}
            />
          </>
        ) : null}
      </div>
    </TooltipProvider>
  )
}
