"use client"

import { useEffect, useMemo, useState } from "react"
import { ImageIcon, InboxIcon } from "lucide-react"

import {
  getPaginationSlice,
  TablePaginationControls,
} from "@/components/table-pagination"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import {
  FEEDBACK_STATUS_CONFIG,
  FEEDBACK_STATUSES,
  FEEDBACK_TYPE_CONFIG,
  FEEDBACK_TYPES,
  type Feedback,
  type FeedbackStatus,
  type FeedbackType,
} from "@/lib/feedback/types"
import { mutateFeedbackNewCount } from "@/lib/feedback/hooks/use-feedback-new-count"
import { formatRelativeTime } from "@/lib/messages/format"

import {
  FeedbackImpactLabel,
  FeedbackStatusBadge,
  FeedbackTypeBadge,
} from "./feedback-badges"
import { FeedbackDetailSheet } from "./feedback-detail-sheet"

type StatusFilter = FeedbackStatus | "all"
type TypeFilter = FeedbackType | "all"

export function FeedbackInbox({
  initialItems,
  loadError,
}: {
  initialItems: Feedback[]
  loadError?: string | null
}) {
  const [items, setItems] = useState(initialItems)
  const [status, setStatus] = useState<StatusFilter>("all")
  const [type, setType] = useState<TypeFilter>("all")
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const selected = items.find((item) => item.id === selectedId) ?? null

  useEffect(() => {
    void mutateFeedbackNewCount()
  }, [])

  const q = search.trim().toLowerCase()
  const filtered = useMemo(
    () =>
      items.filter((item) => {
        if (status !== "all" && item.status !== status) return false
        if (type !== "all" && item.type !== type) return false
        if (!q) return true
        return (
          item.summary.toLowerCase().includes(q) ||
          item.details.toLowerCase().includes(q) ||
          item.submitter.name.toLowerCase().includes(q) ||
          item.reference.toLowerCase().includes(q) ||
          item.area.toLowerCase().includes(q)
        )
      }),
    [items, status, type, q],
  )

  const { paginated, totalPages, rangeStart, rangeEnd, showPagination } =
    getPaginationSlice(filtered, page)

  function handleUpdated(updated: Feedback) {
    setItems((current) =>
      current.map((item) => (item.id === updated.id ? updated : item)),
    )
    void mutateFeedbackNewCount()
  }

  return (
    <div className="flex flex-col gap-4">
      {loadError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {loadError}
        </div>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <Input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value)
            setPage(1)
          }}
          placeholder="Search summary, member, area, or FB-…"
          className="sm:max-w-sm"
          aria-label="Search feedback"
        />
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus((value ?? "all") as StatusFilter)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full sm:w-44" aria-label="Filter by status">
            <SelectValue>
              {(value: StatusFilter) =>
                value === "all" ? "All states" : FEEDBACK_STATUS_CONFIG[value].label
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All states</SelectItem>
            {FEEDBACK_STATUSES.map((value) => (
              <SelectItem key={value} value={value}>
                {FEEDBACK_STATUS_CONFIG[value].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={type}
          onValueChange={(value) => {
            setType((value ?? "all") as TypeFilter)
            setPage(1)
          }}
        >
          <SelectTrigger className="w-full sm:w-44" aria-label="Filter by type">
            <SelectValue>
              {(value: TypeFilter) =>
                value === "all" ? "All types" : FEEDBACK_TYPE_CONFIG[value].label
              }
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {FEEDBACK_TYPES.map((value) => (
              <SelectItem key={value} value={value}>
                {FEEDBACK_TYPE_CONFIG[value].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-12 text-center">
          <InboxIcon className="size-6 text-muted-foreground" aria-hidden />
          <p className="text-sm text-muted-foreground">
            {items.length === 0
              ? "No feedback yet. Submissions from the feedback button will land here."
              : status === "new" && !q && type === "all"
                ? "Inbox zero. Everything new has been triaged."
                : "No feedback matches these filters."}
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
                  <TableHead className="w-[45%]">Feedback</TableHead>
                  <TableHead>Member</TableHead>
                  <TableHead className="hidden lg:table-cell">Area</TableHead>
                  <TableHead className="hidden md:table-cell">Impact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Received</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((item) => (
                  <TableRow
                    key={item.id}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedId(item.id)
                      setDetailOpen(true)
                    }}
                  >
                    <TableCell className="max-w-0 whitespace-normal">
                      <div className="flex flex-col gap-1.5 py-1">
                        <div className="flex items-center gap-2">
                          <FeedbackTypeBadge type={item.type} />
                          {item.attachments.length > 0 ? (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <ImageIcon className="size-3" aria-hidden />
                              {item.attachments.length}
                              <span className="sr-only">attachments</span>
                            </span>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          className="truncate text-left text-sm font-medium outline-none focus-visible:underline"
                          onClick={(event) => {
                            event.stopPropagation()
                            setSelectedId(item.id)
                            setDetailOpen(true)
                          }}
                        >
                          {item.summary}
                        </button>
                        <p className="truncate text-xs text-muted-foreground">
                          {item.details}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="size-6">
                          {item.submitter.avatarUrl ? (
                            <AvatarImage src={item.submitter.avatarUrl} alt="" />
                          ) : null}
                          <AvatarFallback className="text-[10px]">
                            {item.submitter.initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm whitespace-nowrap">
                          {item.submitter.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground lg:table-cell">
                      {item.area}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <FeedbackImpactLabel impact={item.impact} />
                    </TableCell>
                    <TableCell>
                      <FeedbackStatusBadge status={item.status} />
                    </TableCell>
                    <TableCell className="text-right text-sm whitespace-nowrap text-muted-foreground">
                      {formatRelativeTime(item.createdAt)} ago
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {showPagination ? (
            <TablePaginationControls
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          ) : null}
        </>
      )}

      <FeedbackDetailSheet
        item={selected}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onUpdated={handleUpdated}
      />
    </div>
  )
}
