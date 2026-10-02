"use client"

import Link from "next/link"
import { JobMetadataBadges } from "@/components/jobs/job-metadata-badges"
import { JobStatusBadge } from "@/components/jobs/job-status-badge"
import { MyJobActionsDropdown } from "@/components/jobs/my-job-actions-dropdown"

import { type Job } from "@/lib/jobs-data"
import { urgentJobCardBorderStyles } from "@/lib/jobs/format"
import { cn } from "@/lib/utils"

export function MyJobListItem({ job }: { job: Job }) {
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
            <JobStatusBadge
              status={job.status}
              underReviewAt={job.underReviewAt}
            />
            <JobMetadataBadges
              job={job}
              includeUrgentBadge
              includeLocationBadge={false}
              includeCategoryBadges={false}
              includePostedAt={false}
              applicantCount={job.applicationCount ?? 0}
              viewCount={job.viewCount ?? 0}
            />
          </div>
        </div>

        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground text-pretty">
          {job.details}
        </p>

        <div className="mt-auto flex justify-end border-t border-border pt-4">
          <div className="pointer-events-auto relative z-10">
            <MyJobActionsDropdown job={job} />
          </div>
        </div>
      </div>
    </article>
  )
}
