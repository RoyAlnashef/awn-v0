"use client"

import * as React from "react"
import Link from "next/link"
import { Briefcase, Plus } from "lucide-react"
import useSWR from "swr"

import { fetchMyJobs } from "@/lib/jobs/fetch"
import { myJobsKey } from "@/lib/jobs/swr-keys"
import {
  jobsGridClassName,
  jobsListClassName,
} from "@/lib/jobs/view-mode"
import { cn } from "@/lib/utils"
import { useBoardViewMode } from "@/hooks/use-board-view-mode"
import { BoardViewToggle } from "@/components/board-view-toggle"
import { MyJobListItem } from "@/components/jobs/my-job-list-item"
import { MyJobRow } from "@/components/jobs/my-job-row"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

function JobCardSkeleton() {
  return <Skeleton className="h-80 w-full rounded-xl" />
}

function JobRowSkeleton() {
  return <Skeleton className="h-28 w-full rounded-xl" />
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
  const [view, setView] = useBoardViewMode("my-jobs-created")
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
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-8 w-18 rounded-full" />
        </div>
        <div className={view === "grid" ? jobsGridClassName : jobsListClassName}>
          {view === "grid" ? (
            <>
              <JobCardSkeleton />
              <JobCardSkeleton />
              <JobCardSkeleton />
            </>
          ) : (
            <>
              <JobRowSkeleton />
              <JobRowSkeleton />
              <JobRowSkeleton />
            </>
          )}
        </div>
      </div>
    )
  }

  if (jobs.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          <span className="font-medium text-foreground">{jobs.length}</span>{" "}
          {jobs.length === 1 ? "role" : "roles"}
        </p>
        <BoardViewToggle view={view} onViewChange={setView} />
      </div>
      <div className={cn(view === "grid" ? jobsGridClassName : jobsListClassName)}>
        {jobs.map((job) =>
          view === "grid" ? (
            <MyJobListItem key={job.id} job={job} />
          ) : (
            <MyJobRow key={job.id} job={job} />
          ),
        )}
      </div>
    </div>
  )
}
