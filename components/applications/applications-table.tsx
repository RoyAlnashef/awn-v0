"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { ApplicationReviewPanel } from "@/components/applications/application-review-panel"
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
import { approveApplication } from "@/lib/applications/actions"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  const [selected, setSelected] = useState<MembershipApplication | null>(null)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [denyTarget, setDenyTarget] = useState<MembershipApplication | null>(
    null,
  )
  const [page, setPage] = useState(1)

  const q = filters.search.trim().toLowerCase()
  const activeFilterCount = getApplicationFilterCount(filters)

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

  function handleOpenReview(application: MembershipApplication) {
    const isFirstMount = selected === null
    setSelected(application)
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
          <p className="text-sm text-muted-foreground">
            Showing {rangeStart}–{rangeEnd} of {filtered.length}
          </p>
          <div className="min-w-0 overflow-hidden rounded-xl border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Applicant</TableHead>
                  <TableHead className="max-w-xs whitespace-normal">
                    Title
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
                return (
                  <TableRow key={application.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{application.fullName}</p>
                        <p className="text-xs text-muted-foreground">
                          {application.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs whitespace-normal wrap-break-word">
                      {application.title}
                    </TableCell>
                    <TableCell>
                      {application.source === "request_access" ? (
                        <span className="text-sm text-muted-foreground">
                          {application.inviterName}
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Avatar className="size-7">
                            <AvatarImage src={application.inviterAvatarUrl ?? undefined} />
                            <AvatarFallback className="text-[10px]">
                              {initials(application.inviterName)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{application.inviterName}</span>
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
        application={selected}
        open={reviewOpen}
        onOpenChange={handleReviewOpenChange}
        onApprove={handleApprove}
        onDeny={(application) => {
          setReviewOpen(false)
          setDenyTarget(application)
        }}
        approving={isPending}
      />

      <DenyDialog
        application={denyTarget}
        open={Boolean(denyTarget)}
        onOpenChange={(open) => {
          if (!open) setDenyTarget(null)
        }}
        onDenied={() => {
          setDenyTarget(null)
          router.refresh()
        }}
      />
    </div>
  )
}
