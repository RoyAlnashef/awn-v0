"use client"

import { ApplyJobDialog } from "@/components/jobs/apply-job-dialog"
import {
  JobActionTooltip,
  JobActionTooltips,
} from "@/components/jobs/job-action-tooltip"
import { JobDetailDrawer } from "@/components/jobs/job-detail-drawer"
import { JobShareToRoomsButton } from "@/components/jobs/job-share-to-rooms-button"
import { JobShareToMessagesButton } from "@/components/jobs/job-share-to-messages-button"
import { Bookmark, CalendarClock, Group, MapPin, Share } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { mutate } from "swr"

import { formatDateRange, type Job } from "@/lib/jobs-data"
import { toggleSaveJob } from "@/lib/jobs/fetch"
import { jobsListKey } from "@/lib/jobs/swr-keys"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

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

export function JobCard({ job }: { job: Job }) {
  const [saved, setSaved] = useState(job.saved)
  const [applied, setApplied] = useState(job.applied)
  const [applyOpen, setApplyOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    const previous = saved
    setSaved(!saved)
    setSaving(true)
    try {
      const result = await toggleSaveJob(job.id)
      setSaved(result.saved)
      void revalidateJobs()
    } catch (error) {
      setSaved(previous)
      toast.error(error instanceof Error ? error.message : "Could not save job")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <article className="relative flex flex-col gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40">
        {/* Stretched trigger opens the detail drawer; action buttons use pointer-events-auto. */}
        <button
          type="button"
          className="absolute inset-0 z-0 rounded-xl focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          aria-label={`View ${job.role} details`}
          onClick={() => setDetailOpen(true)}
        />

        <div className="pointer-events-none flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-heading text-lg font-semibold tracking-tight text-balance">
                {job.role}
              </h3>
              <Badge variant="secondary">{job.engagement}</Badge>
            </div>
            <p className="text-sm font-medium text-foreground/90">
              {job.production}
            </p>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CalendarClock className="size-3.5 shrink-0" />
                {formatDateRange(job.startDate, job.endDate)}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5 shrink-0" />
                <span className="text-pretty">{job.location}</span>
              </span>
            </p>
          </div>

          <div className="mt-auto flex flex-col gap-4">
            <div className="flex items-center gap-2 border-t border-border pt-4">
              <Avatar className="size-6">
                <AvatarImage src={job.postedBy.avatar} alt="" />
                <AvatarFallback className="text-xs">
                  {initials(job.postedBy.name)}
                </AvatarFallback>
              </Avatar>
              <p className="text-xs text-muted-foreground">
                <span className="text-foreground">{job.postedBy.name}</span>
                {" · "}
                {job.postedAt}
              </p>
            </div>

            <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground text-pretty">
              {job.details}
            </p>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="font-heading text-md font-semibold">
                {job.payRate}
              </span>
              <div className="pointer-events-auto relative z-10 flex min-w-0 flex-wrap items-center justify-end gap-2">
                <JobActionTooltips>
                  <JobActionTooltip
                    label={saved ? "Remove bookmark" : "Bookmark job"}
                  >
                    <Button
                      size="icon"
                      variant="outline"
                      aria-label={saved ? "Remove bookmark" : "Bookmark job"}
                      aria-pressed={saved}
                      disabled={saving}
                      onClick={() => void handleSave()}
                    >
                      <Bookmark
                        className={cn("size-4", saved && "fill-current text-primary")}
                      />
                    </Button>
                  </JobActionTooltip>
                  <JobActionTooltip label="Share as a message" wrap>
                    <JobShareToMessagesButton job={job}>
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label="Share as a message"
                      >
                        <Share className="size-4" />
                      </Button>
                    </JobShareToMessagesButton>
                  </JobActionTooltip>
                  <JobActionTooltip label="Share to a room" wrap>
                    <JobShareToRoomsButton job={job}>
                      <Button
                        size="icon"
                        variant="outline"
                        aria-label="Share to a room"
                      >
                        <Group className="size-4" />
                      </Button>
                    </JobShareToRoomsButton>
                  </JobActionTooltip>
                </JobActionTooltips>
                <Button
                  size="sm"
                  disabled={applied}
                  onClick={() => setApplyOpen(true)}
                >
                  {applied ? "Applied" : "Apply"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </article>

      <JobDetailDrawer
        jobId={job.id}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      <ApplyJobDialog
        job={job}
        open={applyOpen}
        onOpenChange={setApplyOpen}
        onApplied={() => {
          setApplied(true)
          void revalidateJobs()
        }}
      />
    </>
  )
}
