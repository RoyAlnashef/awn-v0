"use client"

import type { ComponentType } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { Eye, Pencil, Users, CircleDot } from "lucide-react"
import useSWR from "swr"

import type { Job } from "@/lib/jobs-data"
import { fetchJobApplications } from "@/lib/jobs/fetch"
import {
  applicationStatusStyles,
  jobStatusStyles,
} from "@/lib/jobs/format"
import { jobApplicationsKey } from "@/lib/jobs/swr-keys"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { JobPageLayout } from "@/components/jobs/job-page-layout"

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string | number
  icon: ComponentType<{ className?: string }>
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        <Icon className="size-3.5" />
        {label}
      </div>
      <p className="font-heading text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  )
}

function ApplicantSkeleton() {
  return <Skeleton className="h-16 w-full rounded-xl" />
}

export function JobManagementDetail({ job }: { job: Job }) {
  const { data, isLoading, error } = useSWR(
    jobApplicationsKey(job.id),
    () => fetchJobApplications(job.id),
  )

  const applications = data?.applications ?? []

  return (
    <JobPageLayout
      title={job.role}
      description={job.production || "Job management"}
      actions={
        <Button
          size="sm"
          variant="outline"
          nativeButton={false}
          render={<Link href={`/jobs/${job.id}/edit`} />}
        >
          <Pencil />
          Edit
        </Button>
      }
      previewJob={job}
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide capitalize ${jobStatusStyles[job.status]}`}
          >
            {job.status}
          </span>
          <span className="text-xs text-muted-foreground">
            Posted {job.postedAt}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard
            label="Views"
            value={job.viewCount ?? 0}
            icon={Eye}
          />
          <StatCard
            label="Applicants"
            value={job.applicationCount ?? 0}
            icon={Users}
          />
          <StatCard
            label="Status"
            value={job.status}
            icon={CircleDot}
          />
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="font-heading text-base font-semibold">Applicants</h3>
            <span className="text-xs text-muted-foreground">
              Application management coming soon
            </span>
          </div>

          {error ? (
            <p className="text-sm text-destructive">
              {error instanceof Error
                ? error.message
                : "Could not load applicants"}
            </p>
          ) : isLoading ? (
            <div className="flex flex-col gap-2">
              <ApplicantSkeleton />
              <ApplicantSkeleton />
            </div>
          ) : applications.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border px-6 py-10 text-center">
              <p className="text-sm text-muted-foreground">
                No applications yet. Share your listing to reach crew on AWN.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {applications.map((application) => (
                <div
                  key={application.id}
                  className="flex items-start justify-between gap-4 rounded-xl border border-border bg-card p-4"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <Avatar className="size-9 shrink-0">
                      <AvatarImage
                        src={application.applicant.avatar}
                        alt=""
                      />
                      <AvatarFallback className="text-xs">
                        {initials(application.applicant.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex min-w-0 flex-col gap-1">
                      <p className="text-sm font-medium">
                        {application.applicant.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {application.applicant.title}
                      </p>
                      {application.note ? (
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {application.note}
                        </p>
                      ) : null}
                      <p className="text-[10px] text-muted-foreground">
                        Applied{" "}
                        {format(
                          new Date(application.createdAt),
                          "MMM d, yyyy",
                        )}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide capitalize ${applicationStatusStyles[application.status]}`}
                  >
                    {application.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </JobPageLayout>
  )
}
