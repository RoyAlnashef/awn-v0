"use client"

import Link from "next/link"
import { Send } from "lucide-react"
import useSWR from "swr"

import { fetchMyApplications } from "@/lib/jobs/fetch"
import { myApplicationsKey } from "@/lib/jobs/swr-keys"
import { MyApplicationListItem } from "@/components/jobs/my-application-list-item"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

function JobCardSkeleton() {
  return <Skeleton className="h-80 w-full rounded-xl" />
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border px-6 py-12 text-center">
      <Send className="size-8 text-muted-foreground/50" />
      <p className="text-sm text-muted-foreground">
        You haven&apos;t applied to any jobs yet.
      </p>
      <Button
        size="sm"
        className="mt-2"
        nativeButton={false}
        render={<Link href="/jobs" />}
      >
        Browse jobs
      </Button>
    </div>
  )
}

export function ApplicationsSection() {
  const { data, error, isLoading } = useSWR(myApplicationsKey, fetchMyApplications)

  const jobs = data?.jobs ?? []

  if (error) {
    return (
      <p className="text-sm text-destructive">
        {error instanceof Error ? error.message : "Could not load applications"}
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
        {jobs.length === 1 ? "application" : "applications"}
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {jobs.map((job) => (
          <MyApplicationListItem key={job.application.id} job={job} />
        ))}
      </div>
    </div>
  )
}
