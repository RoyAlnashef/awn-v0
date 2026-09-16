"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination"

export const PAGE_SIZE = 20

export function getPaginationSlice<T>(
  items: T[],
  page: number,
  pageSize = PAGE_SIZE,
) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))
  const paginated = items.slice((page - 1) * pageSize, page * pageSize)
  const rangeStart =
    items.length === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, items.length)
  const showPagination = items.length > pageSize

  return { paginated, totalPages, rangeStart, rangeEnd, showPagination }
}

export function TablePaginationControls({
  page,
  totalPages,
  onPageChange,
  disabled = false,
}: {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  disabled?: boolean
}) {
  return (
    <div className="flex justify-end">
      <Pagination className="mx-0 w-auto justify-end">
        <PaginationContent>
          <PaginationItem>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1 pl-2"
              disabled={page <= 1 || disabled}
              onClick={() => onPageChange(page - 1)}
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
              disabled={page >= totalPages || disabled}
              onClick={() => onPageChange(page + 1)}
              aria-label="Go to next page"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="size-4" />
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}
