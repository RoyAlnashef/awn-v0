"use client"

import * as React from "react"
import Link from "next/link"
import { Plus } from "lucide-react"

import { AnimatedIcon } from "@/components/icons/animated-icon"
import { SendIcon } from "@/components/ui/send"
import useSWR from "swr"

import { fetchMyApplications } from "@/lib/jobs/fetch"
import { myApplicationsKey } from "@/lib/jobs/swr-keys"
import { jobsListClassName } from "@/lib/jobs/view-mode"
import { MyApplicationRow } from "@/components/jobs/my-application-row"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

function JobRowSkeleton() {
  return <Skeleton className="h-28 w-full rounded-xl" />
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border px-6 py-12 text-center">
      <AnimatedIcon
        icon={SendIcon}
        size={32}
        className="text-muted-foreground/50"
      />
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
      <div className="flex flex-col gap-4">
        <Skeleton className="h-5 w-24" />
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
        {jobs.length === 1 ? "application" : "applications"}
      </p>
      <div className={jobsListClassName}>
        {jobs.map((job) => (
          <MyApplicationRow key={job.application.id} job={job} />
        ))}
      </div>
    </div>
  )
}
