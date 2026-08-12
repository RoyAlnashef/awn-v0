"use client"

import Link from "next/link"
import { Briefcase, Plus } from "lucide-react"
import useSWR from "swr"

import { fetchMyJobs } from "@/lib/jobs/fetch"
import { myJobsKey } from "@/lib/jobs/swr-keys"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { MyJobListItem } from "@/components/jobs/my-job-list-item"

function JobCardSkeleton() {
  return <Skeleton className="h-80 w-full rounded-xl" />
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border px-6 py-12 text-center">
      <Briefcase className="size-8 text-muted-foreground/50" />
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
        Post a job
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <JobCardSkeleton />
        <JobCardSkeleton />
        <JobCardSkeleton />
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {jobs.map((job) => (
          <MyJobListItem key={job.id} job={job} />
        ))}
      </div>
    </div>
  )
}
