"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { MoreHorizontal } from "lucide-react"

import { JobDetailDrawer } from "@/components/jobs/job-detail-drawer"
import { JobStatusBadge } from "@/components/jobs/job-status-badge"
import { PersonProfileDrawer } from "@/components/people/person-profile-drawer"
import {
  closeJobFromReview,
  dismissJobReport,
  releaseJobFromReview,
  startJobUnderReview,
} from "@/lib/moderation/actions"
import { jobReportReasonLabel } from "@/lib/moderation/job-report-reasons"
import type { JobReportRow } from "@/lib/moderation/data"
import { personFromReportMember } from "@/lib/people/fallback-person"
import { updateUserStatus } from "@/lib/users/actions"
import type { Person } from "@/lib/people-data"
import { formatRelativeTime } from "@/lib/messages/format"
import { initials } from "@/lib/users-data"
import {
  getPaginationSlice,
  TablePaginationControls,
} from "@/components/table-pagination"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const ALL = "all" as const

type ReviewFilter = typeof ALL | "under_review" | "not_under_review"

const REVIEW_FILTER_LABELS: Record<ReviewFilter, string> = {
  all: "All jobs",
  under_review: "Under review",
  not_under_review: "Not under review",
}

function matchesReviewFilter(
  report: JobReportRow,
  filter: ReviewFilter,
): boolean {
  if (filter === ALL) return true
  const inReview = Boolean(report.job.underReviewAt)
  return filter === "under_review" ? inReview : !inReview
}

function ReporterCell({
  member,
  onOpen,
}: {
  member: JobReportRow["reporter"]
  onOpen: () => void
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex min-w-0 items-center gap-2 text-left hover:underline"
    >
      <Avatar size="sm">
        {member.avatar ? <AvatarImage src={member.avatar} alt="" /> : null}
        <AvatarFallback>{initials(member.name)}</AvatarFallback>
      </Avatar>
      <span className="truncate font-medium">{member.name}</span>
    </button>
  )
}

export function JobReportsTable({
  initialReports,
  loadError,
}: {
  initialReports: JobReportRow[]
  loadError?: string | null
}) {
  const router = useRouter()
  const [reports, setReports] = useState(initialReports)
  const [search, setSearch] = useState("")
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>(ALL)
  const [page, setPage] = useState(1)
  const [profilePerson, setProfilePerson] = useState<Person | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [jobDrawerId, setJobDrawerId] = useState<string | null>(null)
  const [jobDrawerOpen, setJobDrawerOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const q = search.trim().toLowerCase()

  const filtered = useMemo(() => {
    return reports.filter((report) => {
      if (!matchesReviewFilter(report, reviewFilter)) return false
      if (!q) return true
      const haystack = [
        report.reporter.name,
        report.reporter.email,
        report.job.role,
        report.job.production,
        report.job.posterName,
        jobReportReasonLabel(report.reason),
      ]
        .join(" ")
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [reports, q, reviewFilter])

  const { paginated, totalPages } = getPaginationSlice(filtered, page)

  useEffect(() => {
    setPage(1)
  }, [q, reviewFilter])

  useEffect(() => {
    if (page > totalPages) {
      setPage(Math.max(1, totalPages))
    }
  }, [page, totalPages])

  function openProfile(member: JobReportRow["reporter"]) {
    setProfilePerson(personFromReportMember(member))
    setProfileOpen(true)
  }

  function openJob(jobId: string) {
    setJobDrawerId(jobId)
    setJobDrawerOpen(true)
  }

  function handleDismiss(reportId: string) {
    startTransition(async () => {
      const result = await dismissJobReport(reportId)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      setReports((current) => current.filter((report) => report.id !== reportId))
      toast.success("Report dismissed.")
      router.refresh()
    })
  }

  function handlePutUnderReview(report: JobReportRow) {
    startTransition(async () => {
      const result = await startJobUnderReview(report.job.id, report.id)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      setReports((current) =>
        current.map((row) =>
          row.id === report.id
            ? {
                ...row,
                job: {
                  ...row.job,
                  underReviewAt: new Date().toISOString(),
                  status: "draft",
                },
              }
            : row,
        ),
      )
      toast.success("Job is under review and paused.")
      router.refresh()
    })
  }

  function clearJobReviewInState(jobId: string, status: JobReportRow["job"]["status"]) {
    setReports((current) =>
      current.map((row) =>
        row.job.id === jobId
          ? {
              ...row,
              job: {
                ...row.job,
                underReviewAt: null,
                status,
              },
            }
          : row,
      ),
    )
  }

  function handleRelease(jobId: string) {
    startTransition(async () => {
      const result = await releaseJobFromReview(jobId)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      const report = reports.find((row) => row.job.id === jobId)
      clearJobReviewInState(jobId, report?.job.status ?? "open")
      toast.success("Control returned to the poster.")
      router.refresh()
    })
  }

  function handleClose(jobId: string, status: "filled" | "deleted") {
    startTransition(async () => {
      const result = await closeJobFromReview(jobId, status)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      clearJobReviewInState(jobId, status)
      toast.success(status === "filled" ? "Job marked as filled." : "Job removed.")
      router.refresh()
    })
  }

  function handleSuspendPoster(posterId: string, name: string) {
    startTransition(async () => {
      const result = await updateUserStatus(posterId, "Suspended")
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success(`${name} has been suspended.`)
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search reports…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="max-w-sm"
        />
        <Select
          value={reviewFilter}
          onValueChange={(value) =>
            value && setReviewFilter(value as ReviewFilter)
          }
        >
          <SelectTrigger className="w-44" aria-label="Filter by review status">
            <SelectValue>
              {(value) =>
                REVIEW_FILTER_LABELS[(value as ReviewFilter) ?? ALL]
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(REVIEW_FILTER_LABELS) as ReviewFilter[]).map(
              (key) => (
                <SelectItem key={key} value={key}>
                  {REVIEW_FILTER_LABELS[key]}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </div>

      {loadError ? (
        <p className="text-sm text-destructive">{loadError}</p>
      ) : null}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reporter</TableHead>
              <TableHead>Job</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground">
                  No open reports.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((report) => {
                const inReview = Boolean(report.job.underReviewAt)
                return (
                  <TableRow key={report.id}>
                    <TableCell>
                      <ReporterCell
                        member={report.reporter}
                        onOpen={() => openProfile(report.reporter)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex max-w-sm min-w-0 items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openJob(report.job.id)}
                          className="min-w-0 truncate text-left font-medium hover:underline"
                        >
                          {report.job.role}
                        </button>
                        <JobStatusBadge
                          status={report.job.status}
                          underReviewAt={report.job.underReviewAt}
                          className="shrink-0 px-2 text-xs"
                        />
                      </div>
                    </TableCell>
                    <TableCell>{jobReportReasonLabel(report.reason)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatRelativeTime(report.createdAt)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="Report actions"
                              disabled={isPending}
                            >
                              <MoreHorizontal />
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleDismiss(report.id)}
                          >
                            Dismiss report
                          </DropdownMenuItem>
                          {inReview ? (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleRelease(report.job.id)}
                              >
                                Release to poster
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleClose(report.job.id, "filled")
                                }
                              >
                                Close job — Mark filled
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  handleClose(report.job.id, "deleted")
                                }
                              >
                                Close job — Remove
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handlePutUnderReview(report)}
                            >
                              Put under review
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() =>
                              handleSuspendPoster(
                                report.job.posterId,
                                report.job.posterName,
                              )
                            }
                          >
                            Suspend poster
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <TablePaginationControls
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
      />

      {profilePerson ? (
        <PersonProfileDrawer
          person={profilePerson}
          open={profileOpen}
          onOpenChange={setProfileOpen}
        />
      ) : null}

      <JobDetailDrawer
        jobId={jobDrawerId}
        open={jobDrawerOpen}
        onOpenChange={setJobDrawerOpen}
      />
    </div>
  )
}
