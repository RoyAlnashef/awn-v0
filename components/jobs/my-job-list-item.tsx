"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { JobUrgentHelpBadge } from "@/components/jobs/job-urgent-help-badge"
import {
  CalendarClock,
  Copy,
  Eye,
  MapPin,
  Pause,
  Pencil,
  Users,
} from "lucide-react"
import { toast } from "sonner"
import { mutate } from "swr"

import { formatDateRange, type Job } from "@/lib/jobs-data"
import { createJob, updateJob } from "@/lib/jobs/fetch"
import { jobStatusStyles, urgentAccentTextStyles, urgentJobCardBorderStyles } from "@/lib/jobs/format"
import { myJobsKey } from "@/lib/jobs/swr-keys"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
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
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary">{job.engagement}</Badge>
            <Badge variant="outline">{job.department}</Badge>
            {job.kind === "urgent" ? <JobUrgentHelpBadge /> : null}
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide capitalize ${jobStatusStyles[job.status]}`}
            >
              {job.status}
            </span>
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {job.postedAt}
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <h3 className="font-heading text-lg font-semibold tracking-tight text-balance">
            {job.role}
          </h3>
          <p className="text-sm text-muted-foreground">
            {job.production}
          </p>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            <span className="text-pretty">{job.location || "—"}</span>
          </p>
        </div>

        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground text-pretty">
          {job.details}
        </p>

        <div className="mt-auto flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Eye className="size-3.5" />
              {job.viewCount ?? 0} views
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-3.5" />
              {job.applicationCount ?? 0} applicants
            </span>
          </div>

          <div className="flex items-end justify-between gap-3">
            <div className="flex flex-col gap-1">
              <span
                className={cn(
                  "font-heading text-lg font-semibold",
                  job.kind === "urgent"
                    ? urgentAccentTextStyles
                    : "text-primary-bright",
                )}
              >
                {job.payRate || "Rate TBD"}
              </span>
              {job.startDate && job.endDate ? (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarClock className="size-3.5 shrink-0" />
                  {formatDateRange(job.startDate, job.endDate)}
                </span>
              ) : null}
            </div>

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
      </div>
    </article>
  )
}
