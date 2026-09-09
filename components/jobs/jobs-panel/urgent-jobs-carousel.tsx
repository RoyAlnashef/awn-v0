"use client"

import { useState } from "react"
import { MapPin } from "lucide-react"

import { JobDetailDrawer } from "@/components/jobs/job-detail-drawer"
import { JobUrgentHelpBadge } from "@/components/jobs/job-urgent-help-badge"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { useUrgentJobs } from "@/lib/jobs/hooks/use-urgent-jobs"
import { urgentJobCardBorderStyles } from "@/lib/jobs/format"
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
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  function handleSelectJob(job: Job) {
    onSelectJob?.()
    setSelectedJobId(job.id)
    setDetailOpen(true)
  }

  if (!isLoading && jobs.length === 0) {
    return null
  }

  return (
    <>
      <section className="border-b py-3">
        <h3 className="mb-3 px-4 text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Help Now
        </h3>

        {isLoading ? (
          <div className="mx-4 h-28 animate-pulse rounded-xl border bg-muted/40" />
        ) : (
          <div className="relative pl-4">
            <Carousel
              opts={{
                align: "start",
                dragFree: true,
                containScroll: "trimSnaps",
              }}
              className="w-full"
            >
              <CarouselContent className="ml-0">
                {jobs.map((job) => (
                  <CarouselItem
                    key={job.id}
                    className={cn(
                      "pl-0",
                      jobs.length > 1
                        ? "basis-[88%] pr-3"
                        : "basis-full pr-4",
                    )}
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
                        <span className="shrink-0">{job.postedAt}</span>
                      </div>
                    </button>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {jobs.length > 1 ? (
                <>
                  <CarouselPrevious className="left-3 size-7 border bg-background/90 shadow-sm disabled:pointer-events-none disabled:opacity-0" />
                  <CarouselNext className="right-3 size-7 border bg-background/90 shadow-sm" />
                </>
              ) : null}
            </Carousel>
          </div>
        )}
      </section>

      <JobDetailDrawer
        jobId={selectedJobId}
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open)
          if (!open) setSelectedJobId(null)
        }}
      />
    </>
  )
}
