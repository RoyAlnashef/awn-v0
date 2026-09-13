"use client"

import Link from "next/link"
import { Plus } from "lucide-react"
import useSWR from "swr"

import { AnimatedIcon } from "@/components/icons/animated-icon"
import { BriefcaseBusinessIcon } from "@/components/ui/briefcase-business"
import { CreatedJobsTable } from "@/components/jobs/created-jobs-table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { fetchMyJobs } from "@/lib/jobs/fetch"
import { myJobsKey } from "@/lib/jobs/swr-keys"

function TableSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-5 w-16" />
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Skeleton className="size-4" />
              </TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden md:table-cell">Schedule</TableHead>
              <TableHead className="hidden sm:table-cell">Applicants</TableHead>
              <TableHead className="hidden lg:table-cell">Views</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 4 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="size-4" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-16" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Skeleton className="h-4 w-8" />
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <Skeleton className="h-4 w-8" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto size-8" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
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
    return <TableSkeleton />
  }

  if (jobs.length === 0) {
    return <EmptyState />
  }

  return <CreatedJobsTable jobs={jobs} />
}
