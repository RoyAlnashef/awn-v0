"use client"

import * as React from "react"
import { Loader2, SearchX } from "lucide-react"
import useSWR from "swr"

import { fetchJobs } from "@/lib/jobs/fetch"
import { jobsListKeyWithFilters } from "@/lib/jobs/swr-keys"
import {
  jobsGridClassName,
  jobsListClassName,
} from "@/lib/jobs/view-mode"
import { cn } from "@/lib/utils"
import { useBoardViewMode } from "@/hooks/use-board-view-mode"
import { BoardViewToggle } from "@/components/board-view-toggle"
import { Button } from "@/components/ui/button"
import { JobsFilters, type JobFilters } from "@/components/jobs/jobs-filters"
import { JobCard } from "@/components/jobs/job-card"
import { JobRow } from "@/components/jobs/job-row"

const initialFilters: JobFilters = {
  search: "",
  department: "all",
  engagements: [],
  startFrom: undefined,
  startTo: undefined,
  saved: false,
}

export function JobsBoard() {
  const [view, setView] = useBoardViewMode("jobs")
  const [filters, setFilters] = React.useState<JobFilters>(initialFilters)

  const listKey = React.useMemo(
    () => jobsListKeyWithFilters(filters),
    [filters],
  )

  const { data, error, isLoading, isValidating } = useSWR(listKey, fetchJobs, {
    dedupingInterval: 2000,
    revalidateOnFocus: true,
  })

  function updateFilters(next: Partial<JobFilters>) {
    setFilters((prev) => ({ ...prev, ...next }))
  }

  const activeCount =
    (filters.search.trim() ? 1 : 0) +
    (filters.department !== "all" ? 1 : 0) +
    (filters.engagements.length > 0 ? 1 : 0) +
    (filters.startFrom ? 1 : 0) +
    (filters.startTo ? 1 : 0) +
    (filters.saved ? 1 : 0)

  const jobs = data?.jobs ?? []
  const loading = isLoading && !data

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <JobsFilters
        filters={filters}
        onChange={updateFilters}
        onClear={() => setFilters(initialFilters)}
        activeCount={activeCount}
      />

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {loading ? (
              "Loading roles..."
            ) : (
              <>
                <span className="font-medium text-foreground">{jobs.length}</span>{" "}
                {jobs.length === 1 ? "role" : "roles"}
                {isValidating && !loading ? (
                  <span className="ml-2 inline-flex items-center gap-1 text-xs">
                    <Loader2 className="size-3 animate-spin" />
                    Updating
                  </span>
                ) : null}
              </>
            )}
          </p>

          <BoardViewToggle view={view} onViewChange={setView} />
        </div>

        {error ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
            <SearchX className="size-8 text-muted-foreground" />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">Could not load jobs</p>
              <p className="text-sm text-muted-foreground">
                {error instanceof Error ? error.message : "Something went wrong"}
              </p>
            </div>
          </div>
        ) : loading ? (
          <div className="flex items-center justify-center rounded-xl border border-dashed border-border py-16">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
            <SearchX className="size-8 text-muted-foreground" />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">
                {filters.saved
                  ? "No saved roles match your filters"
                  : "No roles match your filters"}
              </p>
              <p className="text-sm text-muted-foreground">
                {filters.saved
                  ? "Try clearing a filter or bookmark more jobs."
                  : "Try widening your search or clearing a filter."}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters(initialFilters)}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div
            className={cn(
              view === "grid" ? jobsGridClassName : jobsListClassName,
            )}
          >
            {jobs.map((job) =>
              view === "grid" ? (
                <JobCard key={job.id} job={job} />
              ) : (
                <JobRow key={job.id} job={job} />
              ),
            )}
          </div>
        )}
      </div>
    </div>
  )
}
