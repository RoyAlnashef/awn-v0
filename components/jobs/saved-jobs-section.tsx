"use client"

import Link from "next/link"
import useSWR from "swr"

import { AnimatedIcon } from "@/components/icons/animated-icon"
import { JobCard } from "@/components/jobs/job-card"
import { BookmarkIcon } from "@/components/ui/bookmark"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchMyJobs } from "@/lib/jobs/fetch"
import { mySavedJobsKey } from "@/lib/jobs/swr-keys"
import { jobsGridClassName } from "@/lib/jobs/view-mode"

function CardSkeleton() {
  return <Skeleton className="h-52 w-full rounded-xl" />
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
      <AnimatedIcon icon={BookmarkIcon} size={32} className="text-muted-foreground" />
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">No saved jobs yet</p>
        <p className="text-sm text-muted-foreground">
          Browse jobs and bookmark ones you&apos;re interested in.
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        nativeButton={false}
        render={<Link href="/jobs" />}
      >
        Browse jobs
      </Button>
    </div>
  )
}

export function SavedJobsSection() {
  const { data, error, isLoading } = useSWR(mySavedJobsKey, () =>
    fetchMyJobs("saved"),
  )

  const jobs = data?.jobs ?? []

  if (error) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error ? error.message : "Could not load saved jobs"}
      </p>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-5 w-16" />
        <div className={jobsGridClassName}>
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
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
        {jobs.length === 1 ? "saved job" : "saved jobs"}
      </p>
      <div className={jobsGridClassName}>
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  )
}
