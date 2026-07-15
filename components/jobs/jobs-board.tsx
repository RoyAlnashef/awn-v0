"use client"

import * as React from "react"
import { LayoutGrid, List, SearchX } from "lucide-react"

import { jobs as allJobs } from "@/lib/jobs-data"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { JobsFilters, type JobFilters } from "@/components/jobs/jobs-filters"
import { JobCard } from "@/components/jobs/job-card"
import { JobRow } from "@/components/jobs/job-row"

type ViewMode = "grid" | "list"

const initialFilters: JobFilters = {
  search: "",
  department: "all",
  engagements: [],
  startFrom: undefined,
  startTo: undefined,
}

/** Normalize a Date to midnight for inclusive day comparisons. */
function startOfDay(date: Date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function JobsBoard() {
  // Default to the card grid when the user lands on the page.
  const [view, setView] = React.useState<ViewMode>("grid")
  const [filters, setFilters] = React.useState<JobFilters>(initialFilters)

  function updateFilters(next: Partial<JobFilters>) {
    setFilters((prev) => ({ ...prev, ...next }))
  }

  const activeCount =
    (filters.search.trim() ? 1 : 0) +
    (filters.department !== "all" ? 1 : 0) +
    (filters.engagements.length > 0 ? 1 : 0) +
    (filters.startFrom ? 1 : 0) +
    (filters.startTo ? 1 : 0)

  const filtered = React.useMemo(() => {
    const query = filters.search.trim().toLowerCase()
    const from = filters.startFrom ? startOfDay(filters.startFrom) : undefined
    const to = filters.startTo ? startOfDay(filters.startTo) : undefined

    return allJobs.filter((job) => {
      if (query) {
        const haystack =
          `${job.role} ${job.production} ${job.location}`.toLowerCase()
        if (!haystack.includes(query)) return false
      }
      if (filters.department !== "all" && job.department !== filters.department) {
        return false
      }
      if (
        filters.engagements.length > 0 &&
        !filters.engagements.includes(job.engagement)
      ) {
        return false
      }
      const start = startOfDay(new Date(job.startDate))
      if (from && start < from) return false
      if (to && start > to) return false
      return true
    })
  }, [filters])

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
            <span className="font-medium text-foreground">
              {filtered.length}
            </span>{" "}
            {filtered.length === 1 ? "role" : "roles"}
          </p>

          <div className="inline-flex items-center gap-0.5 rounded-full border border-border bg-card p-0.5">
            <Button
              type="button"
              size="icon-sm"
              variant={view === "grid" ? "secondary" : "ghost"}
              onClick={() => setView("grid")}
              aria-pressed={view === "grid"}
              aria-label="Grid view"
            >
              <LayoutGrid />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant={view === "list" ? "secondary" : "ghost"}
              onClick={() => setView("list")}
              aria-pressed={view === "list"}
              aria-label="List view"
            >
              <List />
            </Button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
            <SearchX className="size-8 text-muted-foreground" />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">No roles match your filters</p>
              <p className="text-sm text-muted-foreground">
                Try widening your search or clearing a filter.
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
              view === "grid"
                ? "grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
                : "flex flex-col gap-3",
            )}
          >
            {filtered.map((job) =>
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
