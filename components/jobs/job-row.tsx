"use client"

import { ApplyJobDialog } from "@/components/jobs/apply-job-dialog"
import { JobDetailDrawer } from "@/components/jobs/job-detail-drawer"
import { JobShareRoomPopover } from "@/components/jobs/job-share-room-popover"
import { JobShareToMessagesButton } from "@/components/jobs/job-share-to-messages-button"
import { Bookmark, CalendarClock, Hash, MapPin, Share } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { mutate } from "swr"

import { formatDateRange, type Job } from "@/lib/jobs-data"
import { toggleSaveJob } from "@/lib/jobs/fetch"
import { jobsListKey } from "@/lib/jobs/swr-keys"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

function revalidateJobs() {
  void mutate((key) => typeof key === "string" && key.startsWith(jobsListKey))
}

export function JobRow({ job }: { job: Job }) {
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
      <article className="relative flex flex-col gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 sm:flex-row sm:items-center">
        {/* Stretched trigger opens the detail drawer; action buttons use pointer-events-auto. */}
        <button
          type="button"
          className="absolute inset-0 z-0 rounded-xl focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          aria-label={`View ${job.role} details`}
          onClick={() => setDetailOpen(true)}
        />

        <div className="pointer-events-none flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary">{job.engagement}</Badge>
            <Badge variant="outline">{job.department}</Badge>
            {job.kind === "urgent" ? (
              <Badge variant="destructive">Urgent</Badge>
            ) : null}
            <span className="text-xs text-muted-foreground">
              · {job.postedAt}
            </span>
          </div>
          <h3 className="font-heading text-base font-semibold tracking-tight">
            {job.role}
          </h3>
          <p className="text-sm text-foreground/90">{job.production}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0" />
              {job.location}
            </span>
            <span className="flex items-center gap-1.5">
              <CalendarClock className="size-3.5 shrink-0" />
              {formatDateRange(job.startDate, job.endDate)}
            </span>
          </div>
        </div>

        <div className="pointer-events-none flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center">
          <span className="font-heading text-base font-semibold text-primary">
            {job.payRate}
          </span>
          <div className="pointer-events-auto relative z-10 flex items-center gap-2">
            <Button
              size="icon"
              variant="outline"
              aria-label={saved ? "Remove saved job" : "Save job"}
              aria-pressed={saved}
              disabled={saving}
              onClick={() => void handleSave()}
            >
              <Bookmark
                className={cn("size-4", saved && "fill-current text-primary")}
              />
            </Button>
            <JobShareToMessagesButton job={job}>
              <Button
                size="icon"
                variant="outline"
                aria-label="Share job in a message"
              >
                <Share className="size-4" />
              </Button>
            </JobShareToMessagesButton>
            <JobShareRoomPopover job={job}>
              <Button
                size="icon"
                variant="outline"
                aria-label="Share job to a community"
              >
                <Hash className="size-4" />
              </Button>
            </JobShareRoomPopover>
            <Button
              size="sm"
              disabled={applied}
              onClick={() => setApplyOpen(true)}
            >
              {applied ? "Applied" : "Apply"}
            </Button>
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
