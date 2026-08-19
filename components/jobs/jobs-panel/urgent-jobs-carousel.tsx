"use client"

import { useState } from "react"
import { MapPin } from "lucide-react"

import { JobPreviewDrawer } from "@/components/jobs/job-preview-drawer"
import { JobUrgentHelpBadge } from "@/components/jobs/job-urgent-help-badge"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { useUrgentJobs } from "@/lib/jobs/hooks/use-urgent-jobs"
import {
  formatJobPostedAt,
  urgentJobCardBorderStyles,
} from "@/lib/jobs/format"
import type { Job } from "@/lib/jobs-data"
import { cn } from "@/lib/utils"

export function UrgentJobsCarousel({
  enabled,
  onSelectJob,
}: {
  enabled: boolean
  onSelectJob?: () => void
}) {
  const { jobs, isLoading } = useUrgentJobs({ enabled })
  const [previewJob, setPreviewJob] = useState<Job | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  function handleSelectJob(job: Job) {
    onSelectJob?.()
    setPreviewJob(job)
    setPreviewOpen(true)
  }

  return (
    <>
      <section className="shrink-0 border-b px-4 py-3">
        <h3 className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Urgent jobs
        </h3>

        {isLoading ? (
          <div className="flex gap-3 overflow-hidden">
            {[0, 1].map((i) => (
              <div
                key={i}
                className="h-28 min-w-[85%] animate-pulse rounded-xl border bg-muted/40"
              />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <p className="rounded-xl border border-dashed px-4 py-6 text-center text-sm text-muted-foreground">
            No urgent jobs right now
          </p>
        ) : (
          <div className="relative px-8">
            <Carousel
              opts={{
                align: "start",
                dragFree: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-3">
                {jobs.map((job) => (
                  <CarouselItem
                    key={job.id}
                    className="basis-[85%] pl-3 sm:basis-[75%]"
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectJob(job)}
                      className={cn(
                        "flex h-full w-full flex-col gap-2 rounded-xl border bg-card p-4 text-left transition-colors hover:bg-accent/40",
                        urgentJobCardBorderStyles,
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="min-w-0 font-heading text-base font-semibold tracking-tight text-balance">
                          {job.role}
                        </p>
                        <JobUrgentHelpBadge className="shrink-0" />
                      </div>
                      <p className="line-clamp-1 text-sm text-muted-foreground">
                        {job.production}
                      </p>
                      <div className="mt-auto flex items-center justify-between gap-2 text-xs text-muted-foreground">
                        <span className="inline-flex min-w-0 items-center gap-1">
                          <MapPin className="size-3 shrink-0" />
                          <span className="truncate">{job.location}</span>
                        </span>
                        <span className="shrink-0">
                          {formatJobPostedAt(job.postedAt)}
                        </span>
                      </div>
                    </button>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {jobs.length > 1 ? (
                <>
                  <CarouselPrevious className="left-0 size-7 border bg-background/90 shadow-sm" />
                  <CarouselNext className="right-0 size-7 border bg-background/90 shadow-sm" />
                </>
              ) : null}
            </Carousel>
          </div>
        )}
      </section>

      {previewJob ? (
        <JobPreviewDrawer
          job={previewJob}
          open={previewOpen}
          onOpenChange={setPreviewOpen}
        />
      ) : null}
    </>
  )
}
