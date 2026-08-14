"use client"

import { useRef, useState } from "react"
import { mutate } from "swr"
import { format } from "date-fns"
import {
  Bookmark,
  CalendarClock,
  Flag,
  Group,
  MapPin,
  Share,
  Users,
} from "lucide-react"
import { toast } from "sonner"

import { JobUrgentHelpBadge } from "@/components/jobs/job-urgent-help-badge"
import { ApplyJobDialog } from "@/components/jobs/apply-job-dialog"
import {
  JobActionTooltip,
  JobActionTooltips,
} from "@/components/jobs/job-action-tooltip"
import { ShareToRoomsDrawer } from "@/components/rooms/share-to-rooms-flyout"
import { ShareToMessagesDrawer } from "@/components/messages/share-to-messages-flyout"
import { jobToSharePayload } from "@/lib/messages/job-share"
import {
  formatDateRange,
  parseDateOnly,
  type Job,
} from "@/lib/jobs-data"
import { toggleSaveJob } from "@/lib/jobs/fetch"
import {
  urgentAccentTextStyles,
  urgentApplyButtonStyles,
  urgentBookmarkSavedStyles,
} from "@/lib/jobs/format"
import { jobDetailKey, jobsListKey } from "@/lib/jobs/swr-keys"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DrawerDescription, DrawerTitle } from "@/components/ui/drawer"

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">
      {children}
    </h3>
  )
}

function formatDeadline(deadline: string) {
  return format(parseDateOnly(deadline), "MMM d, yyyy")
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
}

function revalidateJobs() {
  void mutate((key) => typeof key === "string" && key.startsWith(jobsListKey))
}

export function JobDetailContent({
  job,
  applicantCount,
  heroRef,
  preview = false,
  embedded = false,
  className,
}: {
  job: Job
  applicantCount: number
  heroRef: React.RefObject<HTMLDivElement | null>
  preview?: boolean
  embedded?: boolean
  className?: string
}) {
  const [saved, setSaved] = useState(job.saved)
  const [applied, setApplied] = useState(job.applied)
  const [followed, setFollowed] = useState(false)
  const [applyOpen, setApplyOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [shareRoomOpen, setShareRoomOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const isUrgent = job.kind === "urgent"

  async function handleSave() {
    const previous = saved
    setSaved(!saved)
    setSaving(true)
    try {
      const result = await toggleSaveJob(job.id)
      setSaved(result.saved)
      void revalidateJobs()
      void mutate(jobDetailKey(job.id))
    } catch (error) {
      setSaved(previous)
      toast.error(error instanceof Error ? error.message : "Could not save job")
    } finally {
      setSaving(false)
    }
  }

  const hasDates = Boolean(job.startDate && job.endDate)
  const hasDeadline = job.kind === "full" && Boolean(job.deadline)

  const accessibilityLabel = preview ? "Job preview" : `${job.role} job details`
  const accessibilityDescription = preview
    ? "Preview of how your job listing will appear on AWN."
    : `${job.production} · ${job.location}`

  return (
    <JobActionTooltips>
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-hidden",
          embedded && "h-full bg-popover",
          className,
        )}
      >
        {embedded ? (
          <>
            <h2 className="sr-only">{accessibilityLabel}</h2>
            <p className="sr-only">{accessibilityDescription}</p>
          </>
        ) : (
          <>
            <DrawerTitle className="sr-only">{accessibilityLabel}</DrawerTitle>
            <DrawerDescription className="sr-only">
              {accessibilityDescription}
            </DrawerDescription>
          </>
        )}

        <div
          ref={heroRef}
          tabIndex={-1}
          className="relative shrink-0 px-6 pt-5 outline-none"
        >
          <div
            className={cn(
              "flex items-start justify-between gap-3",
              !embedded && "pr-8",
            )}
          >
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="secondary">{job.engagement}</Badge>
              <Badge variant="outline">{job.department}</Badge>
              {job.kind === "urgent" ? <JobUrgentHelpBadge /> : null}
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              {job.postedAt}
            </span>
          </div>

          <div className="mt-4 flex flex-col gap-1.5">
            <h2 className="font-heading text-xl font-semibold tracking-tight text-balance">
              {job.role || "Role title"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {job.production || "Production / tour name"}
            </p>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" />
              <span className="text-pretty">
                {job.location || "Location / routing"}
              </span>
            </p>
          </div>
        </div>

        <ScrollArea className="min-h-0 flex-1">
          <div className="flex flex-col gap-6 px-6 py-5">
            <div className="flex flex-col gap-3">
              <span
                className={cn(
                  "font-heading text-lg font-semibold",
                  isUrgent ? urgentAccentTextStyles : "text-primary-bright",
                )}
              >
                {job.payRate || "Rate TBD"}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {hasDates ? (
                  <Badge variant="outline" className="gap-1 font-normal">
                    <CalendarClock className="size-3" />
                    {formatDateRange(job.startDate, job.endDate)}
                  </Badge>
                ) : (
                  <Badge variant="outline" className="gap-1 font-normal">
                    <CalendarClock className="size-3" />
                    Dates TBD
                  </Badge>
                )}
                {job.kind === "full" ? (
                  hasDeadline ? (
                    <Badge variant="outline" className="font-normal">
                      Apply by {formatDeadline(job.deadline)}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="font-normal">
                      Deadline TBD
                    </Badge>
                  )
                ) : null}
                <Badge variant="outline" className="gap-1 font-normal">
                  <Users className="size-3" />
                  {applicantCount} applicant{applicantCount === 1 ? "" : "s"}
                </Badge>
              </div>
            </div>

            <section className="flex flex-col gap-3">
              <SectionLabel>Details</SectionLabel>
              <p className="text-sm leading-relaxed text-foreground/90 text-pretty">
                {job.details ||
                  "Job details will appear here as you write them."}
              </p>
            </section>

            <section className="flex flex-col gap-3">
              <SectionLabel>Posted by</SectionLabel>
              <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                <Avatar className="size-10">
                  <AvatarImage src={job.postedBy.avatar} alt="" />
                  <AvatarFallback className="text-sm">
                    {initials(job.postedBy.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="font-medium text-foreground">
                    {job.postedBy.name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {job.postedBy.role}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0"
                  aria-pressed={followed}
                  disabled={preview}
                  onClick={() => setFollowed((prev) => !prev)}
                >
                  {followed ? "Following" : "Follow"}
                </Button>
              </div>
            </section>
          </div>
        </ScrollArea>

        <div className="flex shrink-0 items-center gap-2 border-t p-4">
          <div className="flex shrink-0 items-center gap-2">
            <JobActionTooltip
              label={saved ? "Remove bookmark" : "Bookmark job"}
            >
              <Button
                variant="outline"
                size="icon"
                aria-label={saved ? "Remove bookmark" : "Bookmark job"}
                aria-pressed={saved}
                disabled={preview || saving}
                onClick={() => void handleSave()}
              >
                <Bookmark
                  className={cn(
                    "size-4",
                    saved &&
                      (isUrgent
                        ? urgentBookmarkSavedStyles
                        : "fill-current text-primary"),
                  )}
                />
              </Button>
            </JobActionTooltip>
            <JobActionTooltip label="Share as a message" wrap>
              <Button
                size="icon"
                variant="outline"
                aria-label="Share as a message"
                disabled={preview}
                onClick={() => setShareOpen(true)}
              >
                <Share className="size-4" />
              </Button>
            </JobActionTooltip>
            <JobActionTooltip label="Share to a room" wrap>
              <Button
                size="icon"
                variant="outline"
                aria-label="Share to a room"
                disabled={preview}
                onClick={() => setShareRoomOpen(true)}
              >
                <Group className="size-4" />
              </Button>
            </JobActionTooltip>
            <JobActionTooltip label="Report job">
              <Button
                variant="outline"
                size="icon"
                aria-label="Report job"
                disabled={preview}
              >
                <Flag className="size-4" />
              </Button>
            </JobActionTooltip>
          </div>
          <Button
            className={cn("min-w-0 flex-1", isUrgent && urgentApplyButtonStyles)}
            size="sm"
            disabled={preview || applied}
            onClick={() => setApplyOpen(true)}
          >
            {applied ? "Applied" : "Apply"}
          </Button>
        </div>

        {!preview ? (
          <>
            <ApplyJobDialog
              job={job}
              open={applyOpen}
              onOpenChange={setApplyOpen}
              onApplied={() => {
                setApplied(true)
                void revalidateJobs()
                void mutate(jobDetailKey(job.id))
              }}
            />

            <ShareToMessagesDrawer
              open={shareOpen}
              onOpenChange={setShareOpen}
              shareJob={job.id}
              shareLabel={jobToSharePayload(job).role}
            />

            <ShareToRoomsDrawer
              open={shareRoomOpen}
              onOpenChange={setShareRoomOpen}
              shareJob={job.id}
              shareLabel={jobToSharePayload(job).role}
            />
          </>
        ) : null}
      </div>
    </JobActionTooltips>
  )
}

export function useJobDetailHeroRef() {
  return useRef<HTMLDivElement>(null)
}
