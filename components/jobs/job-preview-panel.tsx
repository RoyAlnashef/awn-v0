"use client"

import {
  JobDetailContent,
  useJobDetailHeroRef,
} from "@/components/jobs/job-detail-content"
import type { Job } from "@/lib/jobs-data"

export function JobPreviewPanel({ job }: { job: Job }) {
  const heroRef = useJobDetailHeroRef()
  const applicantCount = job.applicationCount ?? 0

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <p className="mb-4 shrink-0 text-center text-xs font-semibold tracking-widest text-muted-foreground/40 uppercase">
        Preview Only
      </p>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card">
        <JobDetailContent
          job={job}
          applicantCount={applicantCount}
          heroRef={heroRef}
          preview
          embedded
          className="h-full min-h-0"
        />
      </div>
    </div>
  )
}
