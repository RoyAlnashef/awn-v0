"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { ApplicationReviewPanel } from "@/components/applications/application-review-panel"
import { ApplicationTitlesBadges } from "@/components/applications/application-titles-badges"
import {
  ApplicationsFilters,
  getApplicationFilterCount,
  type ApplicationFilters,
} from "@/components/applications/applications-filters"
import { DenyDialog } from "@/components/applications/deny-dialog"
import {
  applicationStatusConfig,
  type MembershipApplication,
} from "@/lib/invites/data"
import {
  approveApplication,
  bulkApproveApplications,
  type BulkApplicationReviewResult,
} from "@/lib/applications/actions"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { initials } from "@/lib/users-data"
import { formatRelativeTime } from "@/lib/messages/format"
import {
  getPaginationSlice,
  TablePaginationControls,
} from "@/components/table-pagination"

const defaultFilters: ApplicationFilters = {
  search: "",
  statuses: [],
  sources: [],
}

function formatBulkApproveMessage(
  result: BulkApplicationReviewResult,
): string {
  const parts: string[] = []

  if (result.succeeded > 0) {
    parts.push(
      `Approved ${result.succeeded} application${result.succeeded === 1 ? "" : "s"}`,
    )
  }

  if (result.skipped > 0) {
    parts.push(`${result.skipped} skipped (not pending)`)
  }

  if (result.failed > 0) {
    parts.push(`${result.failed} failed`)
  }

  return parts.join(", ")
}

function toastBulkApproveResult(result: BulkApplicationReviewResult) {
  if (result.succeeded > 0) {
    toast.success(formatBulkApproveMessage(result))
    return
  }

  if (result.skipped > 0 && result.failed === 0) {
    toast.info(formatBulkApproveMessage(result))
    return
  }

  toast.error(formatBulkApproveMessage(result))
}

export function ApplicationsTable({
  initialApplications,
  loadError,
}: {
  initialApplications: MembershipApplication[]
  loadError?: string | null
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [filters, setFilters] = useState<ApplicationFilters>(defaultFilters)
  const [reviewApplication, setReviewApplication] =
    useState<MembershipApplication | null>(null)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [denyTargets, setDenyTargets] = useState<MembershipApplication[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [approveConfirmOpen, setApproveConfirmOpen] = useState(false)
  const [page, setPage] = useState(1)

  const q = filters.search.trim().toLowerCase()
  const activeFilterCount = getApplicationFilterCount(filters)

  const applicationsById = useMemo(() => {
    const map = new Map<string, MembershipApplication>()
    for (const application of initialApplications) {
      map.set(application.id, application)
    }
    return map
  }, [initialApplications])

  const filtered = useMemo(() => {
    return initialApplications.filter((application) => {
      if (
        filters.statuses.length > 0 &&
        !filters.statuses.includes(application.status)
      ) {
        return false
      }
      if (
        filters.sources.length > 0 &&
        !filters.sources.includes(application.source)
      ) {
        return false
      }
      if (!q) return true
      return (
        application.fullName.toLowerCase().includes(q) ||
        application.email.toLowerCase().includes(q) ||
        application.title.toLowerCase().includes(q) ||
        application.inviterName.toLowerCase().includes(q)
      )
    })
  }, [initialApplications, filters.sources, filters.statuses, q])

  const { paginated, totalPages, rangeStart, rangeEnd, showPagination } =
    getPaginationSlice(filtered, page)

  useEffect(() => {
    setPage(1)
  }, [q, filters.sources, filters.statuses])

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages)
    }
  }, [page, totalPages])

  const allPageSelected =
    paginated.length > 0 && paginated.every((app) => selectedIds.has(app.id))
  const somePageSelected = paginated.some((app) => selectedIds.has(app.id))

  const pendingSelectedApplications = useMemo(() => {
    return [...selectedIds]
      .map((id) => applicationsById.get(id))
      .filter(
        (app): app is MembershipApplication =>
          app !== undefined && app.status === "pending",
      )
  }, [applicationsById, selectedIds])

  const pendingSelectedIds = pendingSelectedApplications.map((app) => app.id)
  const canBulkReview = pendingSelectedIds.length > 0

  function toggleAll() {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (allPageSelected) {
        paginated.forEach((app) => next.delete(app.id))
      } else {
        paginated.forEach((app) => next.add(app.id))
      }
      return next
    })
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function clearSelection() {
    setSelectedIds(new Set())
  }

  function handleOpenReview(application: MembershipApplication) {
    const isFirstMount = reviewApplication === null
    setReviewApplication(application)
    if (isFirstMount) {
      requestAnimationFrame(() => setReviewOpen(true))
    } else {
      setReviewOpen(true)
    }
  }

  function handleReviewOpenChange(open: boolean) {
    setReviewOpen(open)
  }

  function handleApprove(application: MembershipApplication) {
    startTransition(async () => {
      const result = await approveApplication(application.id)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success(`${application.fullName} approved`)
      setReviewOpen(false)
      router.refresh()
    })
  }

  function handleBulkApproveConfirm() {
    startTransition(async () => {
      const result = await bulkApproveApplications(pendingSelectedIds)
      setApproveConfirmOpen(false)

      if (!result.ok) {
        toast.error(result.error)
        return
      }

      toastBulkApproveResult(result.result)
      clearSelection()
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {loadError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {loadError}
        </div>
      ) : null}

      <ApplicationsFilters
        filters={filters}
        onChange={(next) => setFilters((current) => ({ ...current, ...next }))}
        onClear={() => setFilters(defaultFilters)}
        activeCount={activeFilterCount}
      />

      {filtered.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-xl border border-dashed px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {initialApplications.length === 0
              ? "No applications yet."
              : "No applications match your filters."}
          </p>
        </div>
      ) : (
        <>
          <div className="flex min-h-5 flex-wrap items-center gap-2 text-sm text-muted-foreground">
            {selectedIds.size > 0 ? (
              <>
                <span>
                  {selectedIds.size} selected of {initialApplications.length}{" "}
                  applications
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isPending || !canBulkReview}
                    onClick={() => setApproveConfirmOpen(true)}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={isPending || !canBulkReview}
                    onClick={() => setDenyTargets(pendingSelectedApplications)}
                  >
                    Deny
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={clearSelection}
                    disabled={isPending}
                  >
                    Clear
                  </Button>
                </div>
              </>
            ) : (
              <span>
                Showing {rangeStart}–{rangeEnd} of {filtered.length}
              </span>
            )}
          </div>
          <div className="min-w-0 overflow-hidden rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-10">
                    <Checkbox
                      checked={allPageSelected}
                      indeterminate={!allPageSelected && somePageSelected}
                      onCheckedChange={toggleAll}
                      aria-label="Select all applications on this page"
                      disabled={paginated.length === 0 || isPending}
                    />
                  </TableHead>
                  <TableHead>Applicant</TableHead>
                  <TableHead className="max-w-xs whitespace-normal">
                    Titles
                  </TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-25" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((application) => {
                  const status = applicationStatusConfig[application.status]
                  const rowSelected = selectedIds.has(application.id)
                  return (
                    <TableRow
                      key={application.id}
                      data-state={rowSelected ? "selected" : undefined}
                    >
                      <TableCell>
                        <Checkbox
                          checked={rowSelected}
                          onCheckedChange={() => toggleOne(application.id)}
                          aria-label={`Select ${application.fullName}`}
                          disabled={isPending}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{application.fullName}</p>
                          <p className="text-xs text-muted-foreground">
                            {application.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs whitespace-normal wrap-break-word">
                        <ApplicationTitlesBadges title={application.title} />
                      </TableCell>
                      <TableCell>
                        {application.source === "request_access" ? (
                          <span className="text-sm text-muted-foreground">
                            {application.inviterName}
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Avatar className="size-7">
                              <AvatarImage
                                src={application.inviterAvatarUrl ?? undefined}
                              />
                              <AvatarFallback className="text-[10px]">
                                {initials(application.inviterName)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">
                              {application.inviterName}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatRelativeTime(application.createdAt)} ago
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn("border", status.className)}
                        >
                          {status.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenReview(application)}
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
          {showPagination ? (
            <TablePaginationControls
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              disabled={isPending}
            />
          ) : null}
        </>
      )}

      <ApplicationReviewPanel
        application={reviewApplication}
        open={reviewOpen}
        onOpenChange={handleReviewOpenChange}
        onApprove={handleApprove}
        onDeny={(application) => {
          setReviewOpen(false)
          setDenyTargets([application])
        }}
        approving={isPending}
      />

      <DenyDialog
        applications={denyTargets}
        open={denyTargets.length > 0}
        onOpenChange={(open) => {
          if (!open) setDenyTargets([])
        }}
        onDenied={() => {
          setDenyTargets([])
          clearSelection()
          router.refresh()
        }}
      />

      <AlertDialog
        open={approveConfirmOpen}
        onOpenChange={(open) => {
          if (!isPending) setApproveConfirmOpen(open)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingSelectedIds.length === 1
                ? "Approve application?"
                : `Approve ${pendingSelectedIds.length} applications?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingSelectedIds.length === 1
                ? "This applicant will become an AWN member and receive an approval email."
                : `These ${pendingSelectedIds.length} applicants will become AWN members and receive approval emails.`}
              {selectedIds.size > pendingSelectedIds.length
                ? ` ${selectedIds.size - pendingSelectedIds.length} selected application${selectedIds.size - pendingSelectedIds.length === 1 ? "" : "s"} will be skipped because they are not pending.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isPending || !canBulkReview}
              onClick={handleBulkApproveConfirm}
            >
              Approve
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
