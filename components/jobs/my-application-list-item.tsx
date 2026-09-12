"use client"

import * as React from "react"
import { JobMetadataBadges } from "@/components/jobs/job-metadata-badges"
import { JobStatusBadge } from "@/components/jobs/job-status-badge"
import { Undo2 } from "lucide-react"
import { toast } from "sonner"
import { mutate } from "swr"

import { type AppliedJob, withdrawFromJob } from "@/lib/jobs/fetch"
import {
  applicantApplicationStatusConfig,
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
import { Button } from "@/components/ui/button"

export function MyApplicationListItem({ job }: { job: AppliedJob }) {
  const [detailOpen, setDetailOpen] = React.useState(false)
  const [withdrawOpen, setWithdrawOpen] = React.useState(false)
  const [withdrawing, setWithdrawing] = React.useState(false)

  const appliedAtLabel = formatJobPostedAt(job.application.appliedAt)
  const status = applicantApplicationStatusConfig[job.application.status]

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
          "relative flex flex-col gap-4 rounded-xl border bg-card p-5 transition-colors",
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

        <div className="pointer-events-none flex flex-col gap-4">
          <div className="flex flex-col">
            <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
              <h3 className="min-w-0 font-heading text-lg font-semibold tracking-tight text-balance">
                {job.role}
              </h3>
              {job.production ? (
                <p className="min-w-0 text-sm text-muted-foreground text-pretty">
                  {job.production}
                </p>
              ) : null}
            </div>
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              <JobMetadataBadges
                job={job}
                includeUrgentBadge
                includePostedAt={false}
              />
              {job.status !== "open" ? (
                <JobStatusBadge status={job.status} />
              ) : null}
              <span
                className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${status.className}`}
              >
                {status.label}
              </span>
            </div>
          </div>

          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground text-pretty">
            {job.details}
          </p>

          <div className="mt-auto flex flex-wrap items-center justify-between border-t border-border gap-3 pt-4">
            <span
              className={cn(
                "font-heading text-md font-semibold",
                job.kind === "urgent"
                  ? urgentAccentTextStyles
                  : "text-primary-bright",
              )}
            >
              {job.payRate || "Rate TBD"}
            </span>
            <div className="pointer-events-auto relative z-10 flex items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                Applied {appliedAtLabel}
              </span>
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
