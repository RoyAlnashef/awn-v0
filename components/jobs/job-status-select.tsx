"use client"

import { useTransition } from "react"
import { toast } from "sonner"

import type { Job, JobStatus } from "@/lib/jobs-data"
import { updateJob } from "@/lib/jobs/fetch"
import {
  employerSelectableStatuses,
  jobStatusLabels,
} from "@/lib/jobs/format"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"

function statusChangeToast(next: JobStatus, previous: JobStatus) {
  if (next === "draft") {
    toast.success("Job paused — hidden from the board")
    return
  }
  if (next === "open") {
    toast.success(
      previous === "expired" || previous === "deleted"
        ? "Job reopened"
        : "Job is now open",
    )
    return
  }
  if (next === "filled") {
    toast.success("Job marked as filled")
  }
}

export function JobStatusSelect({
  jobId,
  status,
  onStatusChange,
  className,
}: {
  jobId: string
  status: JobStatus
  onStatusChange: (status: JobStatus, job: Job) => void
  className?: string
}) {
  const [isUpdating, startUpdateTransition] = useTransition()
  const options = employerSelectableStatuses(status)

  function handleValueChange(next: JobStatus | null) {
    if (!next || next === status) return

    startUpdateTransition(async () => {
      try {
        const { job } = await updateJob(jobId, { status: next })
        statusChangeToast(next, status)
        onStatusChange(next, job)
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not update job status",
        )
      }
    })
  }

  return (
    <Select
      value={status}
      onValueChange={(value) => handleValueChange(value as JobStatus)}
      disabled={isUpdating}
    >
      <SelectTrigger
        size="sm"
        aria-label="Job status"
        className={cn(
          "border-border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:hover:bg-input/50",
          className,
        )}
      >
        {jobStatusLabels[status]}
      </SelectTrigger>
      <SelectContent align="end">
        {options.map((option) => (
          <SelectItem key={option} value={option}>
            {jobStatusLabels[option]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
