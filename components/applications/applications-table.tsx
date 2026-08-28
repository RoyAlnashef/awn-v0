"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Search } from "lucide-react"

import { ApplicationReviewPanel } from "@/components/applications/application-review-panel"
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
import { Input } from "@/components/ui/input"
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

const ALL = "all"

export function ApplicationsTable({
  initialApplications,
  loadError,
}: {
  initialApplications: MembershipApplication[]
  loadError?: string | null
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<
    MembershipApplication["status"] | typeof ALL
  >(ALL)
  const [selected, setSelected] = useState<MembershipApplication | null>(null)
  const [denyTarget, setDenyTarget] = useState<MembershipApplication | null>(
    null,
  )

  const q = query.trim().toLowerCase()

  const filtered = useMemo(() => {
    return initialApplications.filter((application) => {
      if (statusFilter !== ALL && application.status !== statusFilter) {
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
  }, [initialApplications, q, statusFilter])

  function handleApprove(application: MembershipApplication) {
    startTransition(async () => {
      const result = await approveApplication(application.id)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success(`${application.fullName} approved`)
      setSelected(null)
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search applicants, inviter…"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {[ALL, "pending", "approved", "denied"].map((status) => (
            <Button
              key={status}
              size="sm"
              variant={statusFilter === status ? "default" : "outline"}
              onClick={() =>
                setStatusFilter(status as MembershipApplication["status"] | typeof ALL)
              }
            >
              {status === ALL
                ? "All"
                : applicationStatusConfig[status as MembershipApplication["status"]]
                    .label}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-xl border border-dashed px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {initialApplications.length === 0
              ? "No applications yet."
              : "No applications match your filters."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Applicant</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Invited by</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((application) => {
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
                    <TableCell>{application.title}</TableCell>
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
                        onClick={() => setSelected(application)}
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
      )}

      <ApplicationReviewPanel
        application={selected}
        open={Boolean(selected)}
        onOpenChange={(open) => {
          if (!open) setSelected(null)
        }}
        onApprove={handleApprove}
        onDeny={(application) => {
          setSelected(null)
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
