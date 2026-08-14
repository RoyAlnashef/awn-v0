"use client"

import { CalendarClock, Clock, MapPin, User } from "lucide-react"

import {
  departmentByRole,
  formatDateRange,
  type Job,
  type JobPoster,
} from "@/lib/jobs-data"
import { Badge } from "@/components/ui/badge"

export function JobCardPreview({ job }: { job: Job }) {
  return (
    <article className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-heading text-lg font-semibold tracking-tight text-balance">
              {job.role || "Role title"}
            </h3>
            <Badge variant="secondary">{job.engagement}</Badge>
          </div>
          <p className="text-sm font-medium text-foreground/90">
            {job.production || "Production / tour name"}
          </p>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {job.startDate && job.endDate ? (
              <span className="flex items-center gap-1">
                <CalendarClock className="size-3.5 shrink-0" />
                {formatDateRange(job.startDate, job.endDate)}
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <CalendarClock className="size-3.5 shrink-0" />
                Dates TBD
              </span>
            )}
            <span className="flex items-center gap-1">
              <MapPin className="size-3.5 shrink-0" />
              <span className="text-pretty">
                {job.location || "Location / routing"}
              </span>
            </span>
            <span className="flex items-center gap-1">
              <User className="size-3.5 shrink-0" />
              <span className="text-pretty">{job.postedBy.name}</span>
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3.5 shrink-0" />
              {job.postedAt}
            </span>
          </p>
        </div>

        <div className="flex items-end justify-between gap-3 border-t border-border pt-4">
          <span className="font-heading text-lg font-semibold text-primary-bright">
            {job.payRate || "Rate TBD"}
          </span>
        </div>
      </div>
    </article>
  )
}

export function formToPreviewJob(
  form: {
    kind: Job["kind"]
    role: string
    production: string
    location: string
    rate: string
    startDate?: Date
    endDate?: Date
    engagement: Job["engagement"]
    details: string
  },
  poster: JobPoster,
): Job {
  const startDate = form.startDate
    ? `${form.startDate.getFullYear()}-${String(form.startDate.getMonth() + 1).padStart(2, "0")}-${String(form.startDate.getDate()).padStart(2, "0")}`
    : ""
  const endDate = form.endDate
    ? `${form.endDate.getFullYear()}-${String(form.endDate.getMonth() + 1).padStart(2, "0")}-${String(form.endDate.getDate()).padStart(2, "0")}`
    : ""

  return {
    id: "preview",
    kind: form.kind,
    status: "draft",
    posterId: "",
    role: form.role,
    department: departmentByRole[form.role] ?? "Production",
    production: form.production,
    location: form.location,
    payRate: form.rate,
    startDate,
    endDate,
    deadline: endDate,
    engagement: form.engagement,
    details: form.details,
    postedBy: poster,
    postedAt: "Preview",
    saved: false,
    applied: false,
  }
}
