"use client"

import type { ReactNode } from "react"
import { LayoutGrid, List } from "lucide-react"

import type { BoardViewMode } from "@/lib/board-view-mode"
import { Button } from "@/components/ui/button"

export type ViewToggleOption<Value extends string> = {
  value: Value
  ariaLabel: string
  icon: ReactNode
}

const defaultBoardOptions: ViewToggleOption<BoardViewMode>[] = [
  { value: "grid", ariaLabel: "Grid view", icon: <LayoutGrid /> },
  { value: "list", ariaLabel: "List view", icon: <List /> },
]

export function BoardViewToggle<Value extends string = BoardViewMode>({
  view,
  onViewChange,
  options,
}: {
  view: Value
  onViewChange: (view: Value) => void
  options?: ViewToggleOption<Value>[]
}) {
  const resolved = (options ?? defaultBoardOptions) as ViewToggleOption<Value>[]

  return (
    <div className="inline-flex items-center gap-0.5 rounded-md border border-border bg-card p-0.5">
      {resolved.map((option) => (
        <Button
          key={option.value}
          type="button"
          size="icon-sm"
          variant={view === option.value ? "secondary" : "ghost"}
          onClick={() => onViewChange(option.value)}
          aria-pressed={view === option.value}
          aria-label={option.ariaLabel}
        >
          {option.icon}
        </Button>
      ))}
    </div>
  )
}
