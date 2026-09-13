"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Users,
} from "lucide-react"
import { toast } from "sonner"
import { mutate } from "swr"

import { JobStatusBadge } from "@/components/jobs/job-status-badge"
import { JobUrgentHelpBadge } from "@/components/jobs/job-urgent-help-badge"
import { MyJobActionsDropdown } from "@/components/jobs/my-job-actions-dropdown"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatDateRange, type Job } from "@/lib/jobs-data"
import {
  bulkDeleteJobs,
  bulkPauseJobs,
  type BulkJobActionResult,
} from "@/lib/jobs/fetch"
import { jobStatusSortOrder } from "@/lib/jobs/format"
import { myJobsKey } from "@/lib/jobs/swr-keys"
import { cn } from "@/lib/utils"

const PAGE_SIZE = 20

type StatusSortDirection = "asc" | "desc"

function compareJobsByStatus(
  a: Job,
  b: Job,
  direction: StatusSortDirection,
) {
  const statusDiff =
    jobStatusSortOrder[a.status] - jobStatusSortOrder[b.status]
  if (statusDiff !== 0) {
    return direction === "asc" ? statusDiff : -statusDiff
  }

  return a.role.localeCompare(b.role)
}

function formatBulkResultMessage(
  action: "paused" | "deleted",
  result: BulkJobActionResult,
): string {
  const parts: string[] = []

  if (result.succeeded > 0) {
    parts.push(
      action === "paused"
        ? `Paused ${result.succeeded} job${result.succeeded === 1 ? "" : "s"}`
        : `Deleted ${result.succeeded} job${result.succeeded === 1 ? "" : "s"}`,
    )
  }

  if (result.skipped > 0) {
    parts.push(
      `${result.skipped} skipped (not open)`,
    )
  }

  if (result.failed > 0) {
    parts.push(`${result.failed} failed`)
  }

  return parts.join(", ")
}

function MyJobTableRow({
  job,
  selected,
  onToggle,
  disabled,
}: {
  job: Job
  selected: boolean
  onToggle: () => void
  disabled?: boolean
}) {
  const applicantCount = job.applicationCount ?? 0
  const viewCount = job.viewCount ?? 0
  const hasDates =
    job.kind !== "urgent" && Boolean(job.startDate && job.endDate)

  return (
    <TableRow
      data-state={selected ? "selected" : undefined}
      className={cn(
        job.kind === "urgent" && "border-l-2 border-l-amber-600/50",
      )}
    >
      <TableCell>
        <Checkbox
          checked={selected}
          onCheckedChange={onToggle}
          aria-label={`Select ${job.role}`}
          disabled={disabled}
          onClick={(event) => event.stopPropagation()}
        />
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-col gap-0.5">
            <Link
              href={`/jobs/${job.id}`}
              className="font-medium text-sm hover:underline"
            >
              {job.role}
            </Link>
            {job.production ? (
              <span className="text-xs text-muted-foreground line-clamp-1 max-w-xs text-pretty">
                {job.production}
              </span>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-1.5 lg:hidden">
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground sm:hidden">
              <Users className="size-3" />
              {applicantCount} applicant{applicantCount === 1 ? "" : "s"}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground lg:hidden">
              <Eye className="size-3" />
              {viewCount} view{viewCount === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap items-center gap-1.5">
          <JobStatusBadge status={job.status} />
          {job.kind === "urgent" ? <JobUrgentHelpBadge /> : null}
        </div>
      </TableCell>
      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
        {hasDates ? formatDateRange(job.startDate, job.endDate) : "—"}
      </TableCell>
      <TableCell className="hidden sm:table-cell">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Users className="size-3.5" />
          {applicantCount}
        </div>
      </TableCell>
      <TableCell className="hidden lg:table-cell">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Eye className="size-3.5" />
          {viewCount}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <MyJobActionsDropdown job={job} />
      </TableCell>
    </TableRow>
  )
}

function StatusSortButton({
  direction,
  onToggle,
}: {
  direction: StatusSortDirection | null
  onToggle: () => void
}) {
  const SortIcon =
    direction === "asc"
      ? ArrowUp
      : direction === "desc"
        ? ArrowDown
        : ArrowUpDown

  return (
    <Button
      type="button"
      variant="ghost"
      size="xs"
      className="-ml-2 h-7 gap-1 px-2 font-medium"
      onClick={onToggle}
      aria-label={
        direction === "asc"
          ? "Sort status descending"
          : direction === "desc"
            ? "Clear status sort"
            : "Sort status ascending"
      }
    >
      Status
      <SortIcon
        className={cn(
          "size-3.5",
          direction ? "text-foreground" : "text-muted-foreground",
        )}
      />
    </Button>
  )
}

export function CreatedJobsTable({ jobs }: { jobs: Job[] }) {
  const [statusSort, setStatusSort] = React.useState<StatusSortDirection | null>(
    null,
  )
  const [page, setPage] = React.useState(1)
  const [selected, setSelected] = React.useState<Set<string>>(new Set())
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [isPending, startTransition] = React.useTransition()

  const jobsById = React.useMemo(
    () => new Map(jobs.map((job) => [job.id, job])),
    [jobs],
  )

  const sortedJobs = React.useMemo(() => {
    if (!statusSort) return jobs
    return jobs.toSorted((a, b) => compareJobsByStatus(a, b, statusSort))
  }, [jobs, statusSort])

  const totalPages = Math.max(1, Math.ceil(sortedJobs.length / PAGE_SIZE))
  const paginatedJobs = sortedJobs.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  )
  const rangeStart =
    sortedJobs.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(page * PAGE_SIZE, sortedJobs.length)
  const showPagination = sortedJobs.length > PAGE_SIZE

  React.useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const allPageSelected =
    paginatedJobs.length > 0 &&
    paginatedJobs.every((job) => selected.has(job.id))
  const somePageSelected = paginatedJobs.some((job) => selected.has(job.id))
  const selectedIds = [...selected]
  const selectedJobs = selectedIds
    .map((id) => jobsById.get(id))
    .filter((job): job is Job => job !== undefined)
  const canPause = selectedJobs.some((job) => job.status === "open")

  function toggleStatusSort() {
    setPage(1)
    setStatusSort((current) => {
      if (current === null) return "asc"
      if (current === "asc") return "desc"
      return null
    })
  }

  function toggleAll() {
    setSelected((prev) => {
      const next = new Set(prev)
      if (allPageSelected) {
        paginatedJobs.forEach((job) => next.delete(job.id))
      } else {
        paginatedJobs.forEach((job) => next.add(job.id))
      }
      return next
    })
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function clearSelection() {
    setSelected(new Set())
  }

  function handleBulkResult(
    action: "paused" | "deleted",
    result: BulkJobActionResult,
  ) {
    if (result.succeeded > 0) {
      toast.success(formatBulkResultMessage(action, result))
      clearSelection()
      void mutate(myJobsKey)
      return
    }

    if (result.skipped > 0 && result.failed === 0) {
      toast.info(formatBulkResultMessage(action, result))
      return
    }

    toast.error(formatBulkResultMessage(action, result))
  }

  function handleBulkPause() {
    startTransition(async () => {
      try {
        const result = await bulkPauseJobs(selectedIds, jobsById)
        handleBulkResult("paused", result)
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not pause jobs",
        )
      }
    })
  }

  function handleBulkDelete() {
    startTransition(async () => {
      try {
        const result = await bulkDeleteJobs(selectedIds)
        setDeleteOpen(false)
        handleBulkResult("deleted", result)
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Could not delete jobs",
        )
      }
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        className={cn(
          "flex min-h-5 flex-wrap items-center gap-2 text-sm text-muted-foreground",
          selected.size > 0 && "justify-between",
        )}
        aria-live="polite"
      >
        {selected.size > 0 ? (
          <>
            <span>
              {selected.size} selected of {jobs.length}{" "}
              {jobs.length === 1 ? "role" : "roles"}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                disabled={isPending}
                onClick={clearSelection}
              >
                Clear
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={isPending || !canPause}
                onClick={handleBulkPause}
              >
                Pause
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={isPending}
                onClick={() => setDeleteOpen(true)}
              >
                Delete
              </Button>
            </div>
          </>
        ) : (
          <span>
            Showing {rangeStart}–{rangeEnd} of {sortedJobs.length}
          </span>
        )}
      </div>

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10">
                <Checkbox
                  checked={allPageSelected}
                  indeterminate={!allPageSelected && somePageSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all jobs on this page"
                  disabled={paginatedJobs.length === 0 || isPending}
                />
              </TableHead>
              <TableHead>Role</TableHead>
              <TableHead
                aria-sort={
                  statusSort === "asc"
                    ? "ascending"
                    : statusSort === "desc"
                      ? "descending"
                      : "none"
                }
              >
                <StatusSortButton
                  direction={statusSort}
                  onToggle={toggleStatusSort}
                />
              </TableHead>
              <TableHead className="hidden md:table-cell">Schedule</TableHead>
              <TableHead className="hidden sm:table-cell">Applicants</TableHead>
              <TableHead className="hidden lg:table-cell">Views</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedJobs.map((job) => (
              <MyJobTableRow
                key={job.id}
                job={job}
                selected={selected.has(job.id)}
                onToggle={() => toggleOne(job.id)}
                disabled={isPending}
              />
            ))}
          </TableBody>
        </Table>
      </div>

      {showPagination ? (
        <div className="flex justify-end">
          <Pagination className="mx-0 w-auto justify-end">
            <PaginationContent>
              <PaginationItem>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1 pl-2"
                  disabled={page <= 1 || isPending}
                  onClick={() => setPage((current) => current - 1)}
                  aria-label="Go to previous page"
                >
                  <ChevronLeft className="size-4" />
                  <span className="hidden sm:inline">Previous</span>
                </Button>
              </PaginationItem>
              <PaginationItem>
                <span className="flex h-9 min-w-9 items-center justify-center px-3 text-sm text-muted-foreground">
                  Page {page} of {totalPages}
                </span>
              </PaginationItem>
              <PaginationItem>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="gap-1 pr-2"
                  disabled={page >= totalPages || isPending}
                  onClick={() => setPage((current) => current + 1)}
                  aria-label="Go to next page"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="size-4" />
                </Button>
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      ) : null}

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete jobs?</AlertDialogTitle>
            <AlertDialogDescription>
              {selected.size === 1
                ? `Delete ${selectedJobs[0]?.role ?? "this job"}? It will be removed from your posted jobs.`
                : `Delete ${selected.size} jobs? They will be removed from your posted jobs.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isPending}
              onClick={() => void handleBulkDelete()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
