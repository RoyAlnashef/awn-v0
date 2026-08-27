"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"

import {
  applicationStatusConfig,
  inviteStatusConfig,
  type AdminMemberInvite,
  type MemberInviteStatus,
} from "@/lib/invites/data"
import { cn } from "@/lib/utils"
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
import { formatRelativeTime } from "@/lib/messages/format"

const ALL = "all"

export function AdminInvitesTable({
  initialInvites,
  loadError,
}: {
  initialInvites: AdminMemberInvite[]
  loadError?: string | null
}) {
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<MemberInviteStatus | typeof ALL>(
    ALL,
  )

  const q = query.trim().toLowerCase()

  const filtered = useMemo(() => {
    return initialInvites.filter((invite) => {
      if (statusFilter !== ALL && invite.status !== statusFilter) return false
      if (!q) return true
      return (
        invite.inviteeEmail.toLowerCase().includes(q) ||
        invite.inviterName.toLowerCase().includes(q) ||
        invite.inviterEmail.toLowerCase().includes(q)
      )
    })
  }, [initialInvites, q, statusFilter])

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
            placeholder="Search invitee or inviter…"
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {[ALL, "pending", "accepted", "rescinded", "expired"].map((status) => (
            <Button
              key={status}
              size="sm"
              variant={statusFilter === status ? "default" : "outline"}
              onClick={() =>
                setStatusFilter(status as MemberInviteStatus | typeof ALL)
              }
            >
              {status === ALL
                ? "All"
                : inviteStatusConfig[status as MemberInviteStatus].label}
            </Button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-xl border border-dashed px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {initialInvites.length === 0
              ? "No invites sent yet."
              : "No invites match your filters."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Inviter</TableHead>
                <TableHead>Invitee email</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Invite status</TableHead>
                <TableHead>Application</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((invite) => {
                const status = inviteStatusConfig[invite.status]
                const applicationStatus = invite.applicationStatus
                  ? applicationStatusConfig[invite.applicationStatus]
                  : null

                return (
                  <TableRow key={invite.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{invite.inviterName}</p>
                        <p className="text-xs text-muted-foreground">
                          {invite.inviterEmail}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{invite.inviteeEmail}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatRelativeTime(invite.sentAt)} ago
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
                      {applicationStatus ? (
                        <Badge
                          variant="outline"
                          className={cn("border", applicationStatus.className)}
                        >
                          {applicationStatus.label}
                        </Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
