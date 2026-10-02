"use client"

import { useEffect, useState, useTransition } from "react"
import { EyeOff, Flag } from "lucide-react"
import { mutate } from "swr"
import { toast } from "sonner"

import type { Job } from "@/lib/jobs-data"
import { hideJobFromBoard, submitJobReport } from "@/lib/moderation/actions"
import {
  JOB_REPORT_REASONS,
  isJobReportReason,
  jobReportReasonLabel,
} from "@/lib/moderation/job-report-reasons"
import { JobActionTooltip } from "@/components/jobs/job-action-tooltip"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { jobsListKey } from "@/lib/jobs/swr-keys"

const footerSheetClassName =
  "flex shrink-0 flex-col gap-3 border-t bg-popover p-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-300 ease-out"

type FooterMode = "actions" | "report" | "thanks"

function revalidateJobsBoard() {
  void mutate((key) => typeof key === "string" && key.startsWith(jobsListKey))
}

export function JobDetailInteractiveFooter({
  job,
  preview = false,
  viewerIsPoster = false,
  initialHasOpenReport = false,
  onHidden,
  trailing,
}: {
  job: Job
  preview?: boolean
  viewerIsPoster?: boolean
  initialHasOpenReport?: boolean
  onHidden?: () => void
  trailing: React.ReactNode
}) {
  const [footerMode, setFooterMode] = useState<FooterMode>("actions")
  const [reason, setReason] = useState("")
  const [hasOpenReport, setHasOpenReport] = useState(initialHasOpenReport)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setHasOpenReport(initialHasOpenReport)
  }, [job.id, initialHasOpenReport])

  function handleSubmitReport() {
    if (!reason) {
      toast.error("Select a reason for your report.")
      return
    }
    startTransition(async () => {
      const result = await submitJobReport(job.id, reason)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      setHasOpenReport(true)
      setFooterMode("thanks")
    })
  }

  function handleHideJob() {
    startTransition(async () => {
      const result = await hideJobFromBoard(job.id)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success("Job hidden from your board.")
      revalidateJobsBoard()
      onHidden?.()
    })
  }

  if (footerMode === "thanks") {
    return (
      <div className={footerSheetClassName}>
        <p className="text-sm font-medium">Thank you.</p>
        <p className="text-sm text-muted-foreground">
          Your report has been received and will be reviewed by AWN.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => {
            setReason("")
            setFooterMode("actions")
          }}
        >
          Done
        </Button>
      </div>
    )
  }

  if (footerMode === "report") {
    return (
      <div className={footerSheetClassName}>
        <p className="text-sm font-medium">Report this job</p>
        <div className="flex flex-col gap-2">
          <Label
            htmlFor="job-report-reason"
            className="font-normal text-muted-foreground"
          >
            Why are you reporting this job?
          </Label>
          <Select value={reason} onValueChange={(value) => value && setReason(value)}>
            <SelectTrigger id="job-report-reason" className="w-full">
              <SelectValue placeholder="Select a reason…">
                {(value) =>
                  value && isJobReportReason(value)
                    ? jobReportReasonLabel(value)
                    : value
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {JOB_REPORT_REASONS.map((entry) => (
                <SelectItem key={entry.value} value={entry.value}>
                  {entry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="shrink-0 text-muted-foreground"
            disabled={isPending}
            onClick={() => {
              setReason("")
              setFooterMode("actions")
            }}
          >
            Cancel
          </Button>
          <Button
            className="min-w-0 flex-1"
            disabled={isPending || !reason}
            onClick={handleSubmitReport}
          >
            Submit report
          </Button>
        </div>
      </div>
    )
  }

  const showModeration = !preview && !viewerIsPoster

  return (
    <div className="flex shrink-0 items-center gap-2 border-t p-4">
      {showModeration ? (
        <DropdownMenu>
          <JobActionTooltip label="Report this job" wrap>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Report this job"
                  disabled={isPending}
                >
                  <Flag className="size-4" />
                </Button>
              }
            />
          </JobActionTooltip>
          <DropdownMenuContent align="start" side="top" sideOffset={6}>
            {hasOpenReport ? (
              <DropdownMenuItem disabled>
                <Flag />
                Report submitted
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                disabled={isPending}
                onClick={() => setFooterMode("report")}
              >
                <Flag />
                Report job
              </DropdownMenuItem>
            )}
            <DropdownMenuItem disabled={isPending} onClick={handleHideJob}>
              <EyeOff />
              Hide job
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
      {trailing}
    </div>
  )
}
