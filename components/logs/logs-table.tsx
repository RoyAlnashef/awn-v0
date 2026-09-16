"use client"

import { useMemo, useState } from "react"

import {
  getPaginationSlice,
  TablePaginationControls,
} from "@/components/table-pagination"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { ErrorLog } from "@/lib/logs/data"
import { formatRelativeTime } from "@/lib/messages/format"
import { cn } from "@/lib/utils"

function truncateMessage(message: string, max = 80): string {
  if (message.length <= max) return message
  return `${message.slice(0, max)}…`
}

function sourceBadgeClass(source: ErrorLog["source"]): string {
  return source === "client"
    ? "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300"
    : "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300"
}

export function LogsTable({
  initialLogs,
  loadError,
}: {
  initialLogs: ErrorLog[]
  loadError?: string | null
}) {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState<ErrorLog | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)

  const q = search.trim().toLowerCase()

  const filtered = useMemo(() => {
    if (!q) return initialLogs
    return initialLogs.filter((log) => {
      return (
        log.message.toLowerCase().includes(q) ||
        (log.context?.toLowerCase().includes(q) ?? false) ||
        (log.url?.toLowerCase().includes(q) ?? false)
      )
    })
  }, [initialLogs, q])

  const { paginated, totalPages, rangeStart, rangeEnd, showPagination } =
    getPaginationSlice(filtered, page)

  function handleOpenDetail(log: ErrorLog) {
    setSelected(log)
    setDetailOpen(true)
  }

  return (
    <div className="flex flex-col gap-4">
      {loadError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {loadError}
        </div>
      ) : null}

      <Input
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          setPage(1)
        }}
        placeholder="Search by message, context, or URL…"
        className="max-w-md"
      />

      {filtered.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-xl border border-dashed px-6 py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {initialLogs.length === 0
              ? "No error logs yet."
              : "No logs match your search."}
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
                  <TableHead>Time</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Context</TableHead>
                  <TableHead className="max-w-md">Message</TableHead>
                  <TableHead className="max-w-xs">URL</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((log) => (
                  <TableRow
                    key={log.id}
                    className="cursor-pointer"
                    onClick={() => handleOpenDetail(log)}
                  >
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {formatRelativeTime(log.createdAt)} ago
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn("border capitalize", sourceBadgeClass(log.source))}
                      >
                        {log.source}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {log.context ?? "—"}
                    </TableCell>
                    <TableCell className="max-w-md text-sm">
                      {truncateMessage(log.message)}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                      {log.url ?? "—"}
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

      <Sheet open={detailOpen} onOpenChange={setDetailOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Error details</SheetTitle>
            <SheetDescription>
              {selected
                ? `${formatRelativeTime(selected.createdAt)} ago · ${selected.source}`
                : ""}
            </SheetDescription>
          </SheetHeader>

          {selected ? (
            <div className="flex flex-col gap-4 px-4 pb-6">
              <DetailField label="Message" value={selected.message} />
              <DetailField label="Context" value={selected.context ?? "—"} />
              <DetailField label="Level" value={selected.level} />
              <DetailField label="URL" value={selected.url ?? "—"} />
              <DetailField label="User agent" value={selected.userAgent ?? "—"} />
              {selected.stack ? (
                <div className="grid gap-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Stack trace
                  </p>
                  <pre className="max-h-64 overflow-auto rounded-lg border bg-muted/40 p-3 font-mono text-xs whitespace-pre-wrap">
                    {selected.stack}
                  </pre>
                </div>
              ) : null}
              {Object.keys(selected.metadata).length > 0 ? (
                <div className="grid gap-1">
                  <p className="text-xs font-medium text-muted-foreground">
                    Metadata
                  </p>
                  <pre className="max-h-48 overflow-auto rounded-lg border bg-muted/40 p-3 font-mono text-xs whitespace-pre-wrap">
                    {JSON.stringify(selected.metadata, null, 2)}
                  </pre>
                </div>
              ) : null}
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm break-all">{value}</p>
    </div>
  )
}
