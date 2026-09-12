"use client"

import * as React from "react"
import Link from "next/link"
import { Plus } from "lucide-react"

import { AnimatedIcon } from "@/components/icons/animated-icon"
import { BriefcaseBusinessIcon } from "@/components/ui/briefcase-business"
import useSWR from "swr"

import { fetchMyJobs } from "@/lib/jobs/fetch"
import { myJobsKey } from "@/lib/jobs/swr-keys"
import { jobsListClassName } from "@/lib/jobs/view-mode"
import { MyJobRow } from "@/components/jobs/my-job-row"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

function JobRowSkeleton() {
  return <Skeleton className="h-28 w-full rounded-xl" />
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border px-6 py-12 text-center">
      <AnimatedIcon
        icon={BriefcaseBusinessIcon}
        size={32}
        className="text-muted-foreground/50"
      />
      <p className="text-sm text-muted-foreground">
        You haven&apos;t posted any jobs yet.
      </p>
      <Button
        size="sm"
        className="mt-2 gap-1.5"
        nativeButton={false}
        render={<Link href="/jobs/new" />}
      >
        <Plus className="size-3.5" />
        Post a Job
      </Button>
    </div>
  )
}

export function CreatedJobsSection() {
  const { data, error, isLoading } = useSWR(myJobsKey, () =>
    fetchMyJobs("created"),
  )

  const jobs = data?.jobs ?? []

  if (error) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error ? error.message : "Could not load jobs"}
      </p>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-5 w-16" />
        <div className={jobsListClassName}>
          <JobRowSkeleton />
          <JobRowSkeleton />
          <JobRowSkeleton />
        </div>
      </div>
    )
  }

  if (jobs.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground" aria-live="polite">
        <span className="font-medium text-foreground">{jobs.length}</span>{" "}
        {jobs.length === 1 ? "role" : "roles"}
      </p>
      <div className={jobsListClassName}>
        {jobs.map((job) => (
          <MyJobRow key={job.id} job={job} />
        ))}
      </div>
    </div>
  )
}
