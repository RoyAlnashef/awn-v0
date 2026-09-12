"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { JobMetadataBadges } from "@/components/jobs/job-metadata-badges"
import { JobStatusBadge } from "@/components/jobs/job-status-badge"
import { Copy, Pause, Pencil } from "lucide-react"
import { toast } from "sonner"
import { mutate } from "swr"

import { type Job } from "@/lib/jobs-data"
import { createJob, updateJob } from "@/lib/jobs/fetch"
import { urgentAccentTextStyles, urgentJobCardBorderStyles } from "@/lib/jobs/format"
import { myJobsKey } from "@/lib/jobs/swr-keys"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function MyJobListItem({ job }: { job: Job }) {
  const router = useRouter()
  const [pausing, setPausing] = React.useState(false)
  const [duplicating, setDuplicating] = React.useState(false)

  async function handlePause() {
    if (job.status === "draft") {
      toast.info("This job is already paused")
      return
    }

    setPausing(true)
    try {
      await updateJob(job.id, { status: "draft" })
      toast.success("Job paused — hidden from the board")
      void mutate(myJobsKey)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not pause job")
    } finally {
      setPausing(false)
    }
  }

  async function handleDuplicate() {
    setDuplicating(true)
    try {
      const { job: created } = await createJob({
        kind: job.kind,
        role: job.role,
        production: job.production,
        location: job.location,
        payRate: job.payRate,
        startDate: job.startDate,
        endDate: job.endDate,
        deadline: job.deadline !== job.endDate ? job.deadline : null,
        engagement: job.engagement,
        details: job.details,
        status: "draft",
      })
      toast.success("Draft copy created")
      void mutate(myJobsKey)
      router.push(`/jobs/${created.id}/edit`)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not duplicate job",
      )
    } finally {
      setDuplicating(false)
    }
  }

  return (
    <article
      className={cn(
        "relative flex flex-col gap-4 rounded-xl border bg-card p-5 transition-colors",
        job.kind === "urgent"
          ? urgentJobCardBorderStyles
          : "border-border hover:border-primary/40",
      )}
    >
      <Link
        href={`/jobs/${job.id}`}
        className="absolute inset-0 z-0 rounded-xl focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        aria-label={`Manage ${job.role}`}
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
            <JobStatusBadge status={job.status} />
            <JobMetadataBadges
              job={job}
              includeUrgentBadge
              includeCategoryBadges={false}
              applicantCount={job.applicationCount ?? 0}
              viewCount={job.viewCount ?? 0}
            />
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
          <div className="pointer-events-auto relative z-10 flex flex-wrap items-center justify-end gap-1.5">
            <Button
              size="xs"
              variant="outline"
              nativeButton={false}
              render={<Link href={`/jobs/${job.id}/edit`} />}
            >
              <Pencil className="size-3" />
              Edit
            </Button>
            {job.status === "open" ? (
              <Button
                size="xs"
                variant="outline"
                disabled={pausing}
                onClick={() => void handlePause()}
              >
                <Pause className="size-3" />
                Pause
              </Button>
            ) : null}
            <Button
              size="xs"
              variant="outline"
              disabled={duplicating}
              onClick={() => void handleDuplicate()}
            >
              <Copy className="size-3" />
              Duplicate
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}
