"use client"

import {
  useRef,
  useState,
  useTransition,
  type ReactElement,
  type RefObject,
} from "react"
import { toast } from "sonner"
import {
  BadgeCheck,
  CalendarClock,
  ExternalLink,
  FileDown,
  Flag,
  Users,
  MessageSquare,
  MessagesSquare,
  Plane,
  Plus,
  Sparkles,
  ThumbsUp,
  UserMinus,
} from "lucide-react"

import {
  availabilityConfig,
  getPersonProfile,
  initials,
  type Person,
  type TourCredit,
} from "@/lib/people-data"
import {
  createCreditVouch,
  deleteCreditVouch,
} from "@/lib/account/tour-credits-actions"
import { getPersonSocialLinks } from "@/lib/social-links"
import { personToSharePayload } from "@/lib/messages/member-share"
import { getMemberResumeSignedUrl, toggleConnection } from "@/lib/people/actions"
import { cn } from "@/lib/utils"
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { JobActionTooltip } from "@/components/jobs/job-action-tooltip"
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

/**
 * A single vouch button for a tour credit. Manages its own optimistic state
 * so the full card doesn't need to re-render on every vouch action.
 */
function VouchButton({
  credit,
}: {
  credit: TourCredit
}) {
  const [hasVouched, setHasVouched] = useState(credit.hasVouched ?? false)
  const [vouchCount, setVouchCount] = useState(credit.vouchCount ?? 0)
  const [isPending, startTransition] = useTransition()

  if (!credit.id) return null

  function handleVouch() {
    if (!credit.id) return
    const willVouch = !hasVouched

    // Optimistic update
    setHasVouched(willVouch)
    setVouchCount((c) => c + (willVouch ? 1 : -1))

    startTransition(async () => {
      const result = willVouch
        ? await createCreditVouch(credit.id!)
        : await deleteCreditVouch(credit.id!)

      if (!result.ok) {
        // Revert
        setHasVouched(!willVouch)
        setVouchCount((c) => c + (willVouch ? -1 : 1))
        toast.error(result.error)
      }
    })
  }

  return (
    <button
      type="button"
      onClick={handleVouch}
      disabled={isPending}
      aria-pressed={hasVouched}
      className={`mt-1 inline-flex items-center gap-1.5 self-start rounded-md border px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-60 ${
        hasVouched
          ? "border-primary bg-primary/10 text-primary"
          : "border-border bg-background text-foreground hover:border-primary/50 hover:text-primary"
      }`}
    >
      <ThumbsUp className="size-3" />
      {hasVouched ? "Vouched" : "Vouch"}
      {vouchCount > 0 && (
        <span className="ml-0.5 text-muted-foreground">· {vouchCount}</span>
      )}
    </button>
  )
}

function PreviewTooltip({
  children,
  preview,
  label,
  wrap = false,
}: {
  children: React.ReactNode
  preview: boolean
  label?: string
  wrap?: boolean
}) {
  if (preview) {
    return (
      <Tooltip>
        <TooltipTrigger render={<span className="contents">{children}</span>} />
        <TooltipContent>Preview only</TooltipContent>
      </Tooltip>
    )
  }

  if (label) {
    return (
      <JobActionTooltip label={label} wrap={wrap}>
        {children as ReactElement}
      </JobActionTooltip>
    )
  }

  return children
}

export function PersonProfileCard({
  person,
  tourCredits: tourCreditsOverride,
  mode,
  online,
  className,
  heroRef: heroRefProp,
  onMessage,
  reserveTopRightForClose = false,
}: {
  person: Person
  tourCredits?: TourCredit[]
  mode: "interactive" | "preview"
  online?: boolean
  className?: string
  heroRef?: RefObject<HTMLDivElement | null>
  onMessage?: () => void
  /** Leave room for a drawer close button at the hero's top-right. */
  reserveTopRightForClose?: boolean
}) {
  const profile = getPersonProfile(person, tourCreditsOverride ?? [])
  const resolvedTourCredits = tourCreditsOverride ?? profile.tourCredits
  const availability = availabilityConfig[person.availability]
  const isOnline = online ?? false
  const isPreview = mode === "preview"
  const internalHeroRef = useRef<HTMLDivElement>(null)
  const heroRef = heroRefProp ?? internalHeroRef
  const [followed, setFollowed] = useState(person.followed)
  const [shareOpen, setShareOpen] = useState(false)
  const [shareRoomOpen, setShareRoomOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isResumePending, startResumeTransition] = useTransition()

  function handleFollowToggle() {
    startTransition(async () => {
      const result = await toggleConnection(person.id, followed)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      setFollowed(result.connected)
    })
  }

  function handleResumeDownload() {
    startResumeTransition(async () => {
      const result = await getMemberResumeSignedUrl(person.id)
      if (!result.ok) {
        toast.error(result.error)
        return
      }

      const link = document.createElement("a")
      link.href = result.url
      link.download = result.fileName
      link.rel = "noreferrer"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    })
  }

  const socialLinks = getPersonSocialLinks(person)

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
            <div
              className={cn(
                "absolute top-4 flex items-center gap-1.5 rounded-full bg-background/70 px-2.5 py-1 text-xs font-medium backdrop-blur-sm",
                reserveTopRightForClose ? "right-14" : "right-4",
              )}
            >
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
            <div className="flex items-start justify-between gap-3">
              <Avatar
                className={cn(
                  "-mt-10 size-20 shrink-0 ring-4",
                  availability.avatarRing,
                )}
              >
                <AvatarImage src={person.avatar || undefined} alt="" />
                <AvatarFallback className="text-lg">
                  {initials(person.name)}
                </AvatarFallback>
                <AvatarBadge online={isOnline} className="size-3.5" />
              </Avatar>

              <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 pt-6">
                <PreviewTooltip preview={isPreview} label="View full profile" wrap>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isPreview}
                    aria-disabled={isPreview}
                  >
                    <ExternalLink />
                    Profile
                  </Button>
                </PreviewTooltip>
                {person.hasResume ? (
                  <PreviewTooltip preview={isPreview} label="Download resume" wrap>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={isPreview || isResumePending}
                      aria-disabled={isPreview}
                      onClick={handleResumeDownload}
                    >
                      <FileDown />
                      Resume
                    </Button>
                  </PreviewTooltip>
                ) : null}
              </div>
            </div>

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
            {/* Social links */}
            {socialLinks.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {socialLinks.map((link) => {
                  const LinkIcon = link.icon
                  const button = (
                    <Button
                      variant="outline"
                      size="icon-sm"
                      disabled={isPreview}
                      aria-disabled={isPreview}
                      aria-label={`${link.label}: ${link.display}`}
                      nativeButton={false}
                      render={
                        isPreview ? (
                          <span />
                        ) : (
                          <a
                            href={link.href}
                            target="_blank"
                            rel="noreferrer"
                          />
                        )
                      }
                    >
                      <LinkIcon />
                    </Button>
                  )

                  if (isPreview) {
                    return (
                      <PreviewTooltip key={link.id} preview={isPreview}>
                        {button}
                      </PreviewTooltip>
                    )
                  }

                  return (
                    <Tooltip key={link.id}>
                      <TooltipTrigger render={<span className="inline-flex">{button}</span>} />
                      <TooltipContent>{link.display}</TooltipContent>
                    </Tooltip>
                  )
                })}
              </div>
            ) : null}

            {/* Meta chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              {person.venueTiers.map((tier) => (
                <Badge key={tier} variant="secondary">
                  {tier}
                </Badge>
              ))}
              {person.availableFrom ? (
                <Badge variant="secondary" className="gap-1 font-normal">
                  <CalendarClock className="size-3" />
                  Free {formatShortDate(person.availableFrom)}
                </Badge>
              ) : null}
              {person.workAuth.map((auth) => (
                <Badge key={auth} variant="secondary" className="gap-1 font-normal">
                  {auth === "Passport" ? <Plane className="size-3" /> : null}
                  {auth}
                </Badge>
              ))}
              <Badge variant="secondary" className="font-normal">
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
                      key={credit.id ?? `${credit.title}-${index}`}
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
                              {credit.engagementType ?? credit.venueTier}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {credit.role}
                          </span>
                          {isPreview ? (
                            <span className="mt-1 inline-flex items-center gap-1.5 self-start rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground">
                              <ThumbsUp className="size-3" />
                              {credit.vouchCount ?? 0}{" "}
                              {(credit.vouchCount ?? 0) === 1 ? "vouch" : "vouches"}
                            </span>
                          ) : (
                            <VouchButton credit={credit} />
                          )}
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
          </div>
        </ScrollArea>

        {/* Footer actions */}
        <div className="relative z-10 flex shrink-0 flex-col gap-2 border-t bg-popover p-4">
          <div className="flex items-center gap-2">
            <PreviewTooltip preview={isPreview} label="Share as a message" wrap>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Share as a message"
                disabled={isPreview}
                aria-disabled={isPreview}
                onClick={() => setShareOpen(true)}
              >
                <MessagesSquare className="size-4" />
              </Button>
            </PreviewTooltip>
            <PreviewTooltip preview={isPreview} label="Share to a group" wrap>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Share to a group"
                disabled={isPreview}
                aria-disabled={isPreview}
                onClick={() => setShareRoomOpen(true)}
              >
                <Users className="size-4" />
              </Button>
            </PreviewTooltip>
            <PreviewTooltip
              preview={isPreview}
              label={followed ? "Disconnect" : "Connect"}
            >
              <Button
                variant="ghost"
                size="icon"
                aria-label={followed ? "Disconnect" : "Connect"}
                aria-pressed={followed}
                disabled={isPreview || isPending}
                aria-disabled={isPreview}
                onClick={handleFollowToggle}
              >
                {followed ? <UserMinus /> : <Plus />}
              </Button>
            </PreviewTooltip>
            <PreviewTooltip preview={isPreview} label="Message">
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
          </div>
          <PreviewTooltip preview={isPreview} label="Report member">
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
