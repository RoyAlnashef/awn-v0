"use client"

import { LayoutGrid, List } from "lucide-react"

import type { BoardViewMode } from "@/lib/board-view-mode"
import { Button } from "@/components/ui/button"

export function BoardViewToggle({
  view,
  onViewChange,
}: {
  view: BoardViewMode
  onViewChange: (view: BoardViewMode) => void
}) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-md border border-border bg-card p-0.5">
      <Button
        type="button"
        size="icon-sm"
        variant={view === "grid" ? "secondary" : "ghost"}
        onClick={() => onViewChange("grid")}
        aria-pressed={view === "grid"}
        aria-label="Grid view"
      >
        <LayoutGrid />
      </Button>
      <Button
        type="button"
        size="icon-sm"
        variant={view === "list" ? "secondary" : "ghost"}
        onClick={() => onViewChange("list")}
        aria-pressed={view === "list"}
        aria-label="List view"
      >
        <List />
      </Button>
    </div>
  )
}
