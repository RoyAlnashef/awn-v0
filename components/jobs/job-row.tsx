"use client"

import { useState } from "react"
import { Bookmark, CalendarClock, MapPin } from "lucide-react"

import { cn } from "@/lib/utils"
import { formatDateRange, type Job } from "@/lib/jobs-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function JobRow({ job }: { job: Job }) {
  const [saved, setSaved] = useState(false)

  return (
    <article className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 sm:flex-row sm:items-center">
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="secondary">{job.engagement}</Badge>
          <Badge variant="outline">{job.department}</Badge>
          <span className="text-xs text-muted-foreground">· {job.postedAt}</span>
        </div>
        <h3 className="font-heading text-base font-semibold tracking-tight">
          {job.role}
        </h3>
        <p className="text-sm text-foreground/90">{job.production}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0" />
            {job.location}
          </span>
          <span className="flex items-center gap-1.5">
            <CalendarClock className="size-3.5 shrink-0" />
            {formatDateRange(job.startDate, job.endDate)}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center">
        <span className="font-heading text-base font-semibold text-primary">
          {job.payRate}
        </span>
        <div className="flex items-center gap-2">
          <Button
            size="icon"
            variant="outline"
            aria-label={saved ? "Remove saved job" : "Save job"}
            aria-pressed={saved}
            onClick={() => setSaved((prev) => !prev)}
          >
            <Bookmark
              className={cn("size-4", saved && "fill-current text-primary")}
            />
          </Button>
          <Button size="sm">Apply</Button>
        </div>
      </div>
    </article>
  )
}
