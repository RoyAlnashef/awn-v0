"use client"

import { CalendarClock, MapPin } from "lucide-react"

import {
  departmentByRole,
  formatDateRange,
  type Job,
  type JobPoster,
} from "@/lib/jobs-data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
}

export function JobCardPreview({ job }: { job: Job }) {
  return (
    <article className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary">{job.engagement}</Badge>
            <Badge variant="outline">{job.department}</Badge>
            {job.kind === "urgent" ? (
              <Badge variant="destructive">Urgent</Badge>
            ) : null}
          </div>
          <span className="shrink-0 text-xs text-muted-foreground">
            {job.postedAt}
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <h3 className="font-heading text-lg font-semibold tracking-tight text-balance">
            {job.role || "Role title"}
          </h3>
          <p className="text-sm font-medium text-foreground/90">
            {job.production || "Production / tour name"}
          </p>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" />
            <span className="text-pretty">
              {job.location || "Location / routing"}
            </span>
          </p>
        </div>

        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground text-pretty">
          {job.details || "Job details will appear here as you write them."}
        </p>

        <div className="mt-auto flex flex-col gap-4">
          <div className="flex items-center gap-2 border-t border-border pt-4">
            <Avatar className="size-7">
              <AvatarImage src={job.postedBy.avatar} alt="" />
              <AvatarFallback className="text-xs">
                {initials(job.postedBy.name)}
              </AvatarFallback>
            </Avatar>
            <p className="text-xs text-muted-foreground">
              <span className="text-foreground">{job.postedBy.name}</span> ·{" "}
              {job.postedBy.role}
            </p>
          </div>

          <div className="flex items-end justify-between gap-3">
            <div className="flex flex-col gap-1">
              <span className="font-heading text-lg font-semibold text-primary">
                {job.payRate || "Rate TBD"}
              </span>
              {job.startDate && job.endDate ? (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarClock className="size-3.5 shrink-0" />
                  {formatDateRange(job.startDate, job.endDate)}
                </span>
              ) : (
                <span className="text-xs text-muted-foreground">Dates TBD</span>
              )}
            </div>
          </div>
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
