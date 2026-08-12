"use client"

import * as React from "react"
import { CalendarClock, MapPin, Undo2 } from "lucide-react"
import { toast } from "sonner"
import { mutate } from "swr"

import { formatDateRange } from "@/lib/jobs-data"
import { type AppliedJob, withdrawFromJob } from "@/lib/jobs/fetch"
import {
  applicationStatusStyles,
  formatJobPostedAt,
} from "@/lib/jobs/format"
import { jobsListKey, myApplicationsKey } from "@/lib/jobs/swr-keys"
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

export function MyApplicationListItem({ job }: { job: AppliedJob }) {
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
      <article className="relative flex flex-col gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40">
        <button
          type="button"
          className="absolute inset-0 z-0 rounded-xl focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          aria-label={`View ${job.role} details`}
          onClick={() => setDetailOpen(true)}
        />

        <div className="pointer-events-none flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-1.5">
              <Badge variant="secondary">{job.engagement}</Badge>
              <Badge variant="outline">{job.department}</Badge>
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide capitalize ${applicationStatusStyles[job.application.status]}`}
              >
                {job.application.status}
              </span>
              {job.kind === "urgent" ? (
                <Badge variant="destructive">Urgent</Badge>
              ) : null}
            </div>
            <span className="shrink-0 text-xs text-muted-foreground">
              Applied {appliedAtLabel}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <h3 className="font-heading text-lg font-semibold tracking-tight text-balance">
              {job.role}
            </h3>
            <p className="text-sm font-medium text-foreground/90">
              {job.production}
            </p>
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-3.5 shrink-0" />
              <span className="text-pretty">{job.location || "—"}</span>
            </p>
          </div>

          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground text-pretty">
            {job.details}
          </p>

          <div className="mt-auto flex items-end justify-between gap-3 border-t border-border pt-4">
            <div className="flex flex-col gap-1">
              <span className="font-heading text-lg font-semibold text-primary">
                {job.payRate || "Rate TBD"}
              </span>
              {job.startDate && job.endDate ? (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarClock className="size-3.5 shrink-0" />
                  {formatDateRange(job.startDate, job.endDate)}
                </span>
              ) : null}
            </div>

            <div className="pointer-events-auto relative z-10">
              <Button
                size="xs"
                variant="outline"
                onClick={(event) => {
                  event.stopPropagation()
                  setWithdrawOpen(true)
                }}
              >
                <Undo2 className="size-3" />
                Withdraw
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
