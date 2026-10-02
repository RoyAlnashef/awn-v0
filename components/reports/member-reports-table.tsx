"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { MoreHorizontal } from "lucide-react"

import { PersonProfileDrawer } from "@/components/people/person-profile-drawer"
import { dismissMemberReport } from "@/lib/moderation/actions"
import { memberReportReasonLabel } from "@/lib/moderation/report-reasons"
import type { MemberReportRow } from "@/lib/moderation/data"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

function MemberCell({
  member,
  onOpen,
}: {
  member: MemberReportRow["reporter"]
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

export function MemberReportsTable({
  initialReports,
  loadError,
}: {
  initialReports: MemberReportRow[]
  loadError?: string | null
}) {
  const router = useRouter()
  const [reports, setReports] = useState(initialReports)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [profilePerson, setProfilePerson] = useState<Person | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const q = search.trim().toLowerCase()

  const filtered = useMemo(() => {
    if (!q) return reports
    return reports.filter((report) => {
      const haystack = [
        report.reporter.name,
        report.reporter.email,
        report.reportee.name,
        report.reportee.email,
        memberReportReasonLabel(report.reason),
      ]
        .join(" ")
        .toLowerCase()
      return haystack.includes(q)
    })
  }, [reports, q])

  const { paginated, totalPages } = getPaginationSlice(filtered, page)

  function openProfile(member: MemberReportRow["reporter"]) {
    setProfilePerson(personFromReportMember(member))
    setProfileOpen(true)
  }

  function handleDismiss(reportId: string) {
    startTransition(async () => {
      const result = await dismissMemberReport(reportId)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      setReports((current) => current.filter((report) => report.id !== reportId))
      toast.success("Report dismissed.")
      router.refresh()
    })
  }

  function handleSuspend(userId: string, name: string) {
    startTransition(async () => {
      const result = await updateUserStatus(userId, "Suspended")
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
      <Input
        placeholder="Search reports…"
        value={search}
        onChange={(event) => {
          setSearch(event.target.value)
          setPage(1)
        }}
        className="max-w-sm"
      />

      {loadError ? (
        <p className="text-sm text-destructive">{loadError}</p>
      ) : null}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reporter</TableHead>
              <TableHead>Reported</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Blocked</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground">
                  No open reports.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <MemberCell
                      member={report.reporter}
                      onOpen={() => openProfile(report.reporter)}
                    />
                  </TableCell>
                  <TableCell>
                    <MemberCell
                      member={report.reportee}
                      onOpen={() => openProfile(report.reportee)}
                    />
                  </TableCell>
                  <TableCell>{memberReportReasonLabel(report.reason)}</TableCell>
                  <TableCell>
                    {report.blockedOnSubmit ? (
                      <Badge variant="secondary">Yes</Badge>
                    ) : (
                      <span className="text-muted-foreground">No</span>
                    )}
                  </TableCell>
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
                        <DropdownMenuItem
                          onClick={() =>
                            handleSuspend(
                              report.reporter.id,
                              report.reporter.name,
                            )
                          }
                        >
                          Suspend reporter
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleSuspend(
                              report.reportee.id,
                              report.reportee.name,
                            )
                          }
                        >
                          Suspend reportee
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
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
    </div>
  )
}
