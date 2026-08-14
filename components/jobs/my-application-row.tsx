"use client"

import * as React from "react"
import { JobUrgentHelpBadge } from "@/components/jobs/job-urgent-help-badge"
import { CalendarClock, MapPin, Undo2 } from "lucide-react"
import { toast } from "sonner"
import { mutate } from "swr"

import { formatDateRange } from "@/lib/jobs-data"
import { type AppliedJob, withdrawFromJob } from "@/lib/jobs/fetch"
import {
  applicationStatusStyles,
  formatJobPostedAt,
  urgentAccentTextStyles,
  urgentJobCardBorderStyles,
} from "@/lib/jobs/format"
import { jobsListKey, myApplicationsKey } from "@/lib/jobs/swr-keys"
import { cn } from "@/lib/utils"
import { JobDetailDrawer } from "@/components/jobs/job-detail-drawer"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function MyApplicationRow({ job }: { job: AppliedJob }) {
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [withdrawOpen, setWithdrawOpen] = React.useState(false)
  const [withdrawing, setWithdrawing] = React.useState(false)

  const appliedAtLabel = formatJobPostedAt(job.application.appliedAt)

  async function handleWithdraw() {
    setWithdrawing(true)
    try {
      await withdrawFromJob(job.id)
      toast.success("Application withdrawn")
      void mutate(myApplicationsKey)
      void mutate((key) => typeof key === "string" && key.startsWith(jobsListKey))
      setWithdrawOpen(false)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not withdraw application",
      )
    } finally {
      setWithdrawing(false)
    }
  }

  return (
    <>
      <article
        className={cn(
          "relative flex flex-col gap-4 rounded-xl border bg-card p-4 transition-colors sm:flex-row sm:items-center",
          job.kind === "urgent"
            ? urgentJobCardBorderStyles
            : "border-border hover:border-primary/40",
        )}
      >
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
            {job.kind === "urgent" ? <JobUrgentHelpBadge /> : null}
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide capitalize ${applicationStatusStyles[job.application.status]}`}
            >
              {job.application.status}
            </span>
            <span className="text-xs text-muted-foreground">
              · Applied {appliedAtLabel}
            </span>
          </div>
          <h3 className="font-heading text-base font-semibold tracking-tight">
            {job.role}
          </h3>
          <p className="text-sm text-foreground/90">{job.production}</p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5 shrink-0" />
              {job.location || "—"}
            </span>
            {job.startDate && job.endDate ? (
              <span className="flex items-center gap-1.5">
                <CalendarClock className="size-3.5 shrink-0" />
                {formatDateRange(job.startDate, job.endDate)}
              </span>
            ) : null}
          </div>
        </div>

        <div className="pointer-events-none flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center">
          <span
            className={cn(
              "font-heading text-base font-semibold",
              job.kind === "urgent"
                ? urgentAccentTextStyles
                : "text-primary-bright",
            )}
          >
            {job.payRate || "Rate TBD"}
          </span>
          <div className="pointer-events-auto relative z-10">
            <Button
              size="sm"
              variant="outline"
              onClick={(event) => {
                event.stopPropagation()
                setWithdrawOpen(true)
              }}
            >
              <Undo2 className="size-3.5" />
              Withdraw
            </Button>
          </div>
        </div>
      </article>

      <JobDetailDrawer
        jobId={job.id}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      <AlertDialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>Withdraw application?</AlertDialogTitle>
            <AlertDialogDescription>
              You can apply again later from the jobs board if the listing is
              still open.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={withdrawing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={withdrawing}
              onClick={() => void handleWithdraw()}
            >
              Withdraw
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
