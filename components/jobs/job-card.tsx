"use client"

import { ApplyJobDialog } from "@/components/jobs/apply-job-dialog"
import {
  JobActionTooltip,
  JobActionTooltips,
} from "@/components/jobs/job-action-tooltip"
import { JobDetailDrawer } from "@/components/jobs/job-detail-drawer"
import { JobShareToRoomsButton } from "@/components/jobs/job-share-to-rooms-button"
import { JobShareToMessagesButton } from "@/components/jobs/job-share-to-messages-button"
import { JobMetadataBadges } from "@/components/jobs/job-metadata-badges"
import { JobUrgentHelpBadge } from "@/components/jobs/job-urgent-help-badge"
import { Bookmark, Group, Share } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { mutate } from "swr"

import {
  urgentAccentTextStyles,
  urgentApplyButtonStyles,
  urgentBookmarkSavedStyles,
  urgentJobCardBorderStyles,
} from "@/lib/jobs/format"
import { type Job } from "@/lib/jobs-data"
import { toggleSaveJob } from "@/lib/jobs/fetch"
import { jobsListKey } from "@/lib/jobs/swr-keys"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

function revalidateJobs() {
  void mutate((key) => typeof key === "string" && key.startsWith(jobsListKey))
}

export function JobCard({ job }: { job: Job }) {
  const [saved, setSaved] = useState(job.saved)
  const [applied, setApplied] = useState(job.applied)
  const [applyOpen, setApplyOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
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
    } catch (error) {
      setSaved(previous)
      toast.error(error instanceof Error ? error.message : "Could not save job")
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <article
        className={cn(
          "relative flex flex-col gap-4 rounded-xl border bg-card p-5 transition-colors",
          job.kind === "urgent"
            ? urgentJobCardBorderStyles
            : "border-border hover:border-primary/40",
        )}
      >
        {/* Stretched trigger opens the detail drawer; action buttons use pointer-events-auto. */}
        <button
          type="button"
          className="absolute inset-0 z-0 rounded-xl focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          aria-label={`View ${job.role} details`}
          onClick={() => setDetailOpen(true)}
        />

        <div className="pointer-events-none flex flex-col gap-4">
          <div className="flex flex-col">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="min-w-0 font-heading text-lg font-semibold tracking-tight text-balance">
                  {job.role}
                </h3>
                {job.kind === "urgent" ? (
                  <JobUrgentHelpBadge className="shrink-0" />
                ) : null}
              </div>
              <p className="text-sm font-medium text-foreground/90">
                {job.production}
              </p>
            </div>
            <JobMetadataBadges job={job} className="mt-2.5" />
          </div>

          <div className="flex flex-wrap items-center justify-between border-t border-border gap-3 pt-4">
              <span
                className={cn(
                  "font-heading text-md font-semibold",
                  isUrgent ? urgentAccentTextStyles : "text-primary-bright",
                )}
              >
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
                  className={isUrgent ? urgentApplyButtonStyles : undefined}
                  disabled={applied}
                  onClick={() => setApplyOpen(true)}
                >
                  {applied ? "Applied" : "Apply"}
                </Button>
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
