"use client"

import * as React from "react"
import { Calendar as CalendarIcon, ChevronDown, Search, X } from "lucide-react"

import {
  engagementTypes,
  roleGroups,
  type EngagementType,
} from "@/lib/jobs-data"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { DatePicker } from "@/components/jobs/date-picker"

export interface JobFilters {
  search: string
  department: string
  engagements: EngagementType[]
  startFrom?: Date
  startTo?: Date
}

function FilterButton({
  label,
  count,
  active,
  ...props
}: React.ComponentProps<typeof Button> & {
  label: string
  count?: number
  active?: boolean
}) {
  return (
    <Button
      type="button"
      variant="outline"
      className={cn(
        "gap-1.5",
        active && "border-primary/60 bg-primary/10 text-foreground",
      )}
      {...props}
    >
      {label}
      {count ? (
        <span className="flex size-4.5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
          {count}
        </span>
      ) : null}
      <ChevronDown className="size-3.5 text-muted-foreground" />
    </Button>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
      {children}
    </span>
  )
}

export function JobsFilters({
  filters,
  onChange,
  onClear,
  activeCount,
}: {
  filters: JobFilters
  onChange: (next: Partial<JobFilters>) => void
  onClear: () => void
  activeCount: number
}) {
  function toggleEngagement(type: EngagementType) {
    const active = filters.engagements.includes(type)
    onChange({
      engagements: active
        ? filters.engagements.filter((t) => t !== type)
        : [...filters.engagements, type],
    })
  }

  const departmentLabel =
    filters.department === "all" ? "Department" : filters.department
  const datesActive = Boolean(filters.startFrom || filters.startTo)

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative sm:max-w-xs sm:flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="Search role, production, city…"
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Department */}
        <Popover>
          <PopoverTrigger
            render={
              <FilterButton
                label={departmentLabel}
                active={filters.department !== "all"}
              />
            }
          />
          <PopoverContent align="start" className="w-56 p-1.5">
            <div className="flex max-h-72 flex-col gap-0.5 overflow-y-auto">
              <button
                type="button"
                onClick={() => onChange({ department: "all" })}
                className={cn(
                  "rounded-md px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-muted",
                  filters.department === "all" &&
                    "bg-primary/10 font-medium text-foreground",
                )}
              >
                All departments
              </button>
              {roleGroups.map((group) => (
                <button
                  key={group.department}
                  type="button"
                  onClick={() => onChange({ department: group.department })}
                  className={cn(
                    "rounded-md px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-muted",
                    filters.department === group.department &&
                      "bg-primary/10 font-medium text-foreground",
                  )}
                >
                  {group.department}
                </button>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Engagement type */}
        <Popover>
          <PopoverTrigger
            render={
              <FilterButton
                label="Engagement"
                count={filters.engagements.length}
                active={filters.engagements.length > 0}
              />
            }
          />
          <PopoverContent align="start" className="w-64">
            <FieldLabel>Engagement type</FieldLabel>
            <div className="flex flex-wrap gap-1.5">
              {engagementTypes.map((type) => {
                const active = filters.engagements.includes(type)
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => toggleEngagement(type)}
                    aria-pressed={active}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-input/30 text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {type}
                  </button>
                )
              })}
            </div>
          </PopoverContent>
        </Popover>

        {/* Start date range */}
        <Popover>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "gap-1.5",
                  datesActive &&
                    "border-primary/60 bg-primary/10 text-foreground",
                )}
              >
                <CalendarIcon className="size-3.5 text-muted-foreground" />
                Dates
                {datesActive ? (
                  <span className="flex size-4.5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                    {(filters.startFrom ? 1 : 0) + (filters.startTo ? 1 : 0)}
                  </span>
                ) : (
                  <ChevronDown className="size-3.5 text-muted-foreground" />
                )}
              </Button>
            }
          />
          <PopoverContent align="start" className="w-64">
            <div className="flex flex-col gap-2">
              <FieldLabel>Starts on / after</FieldLabel>
              <DatePicker
                value={filters.startFrom}
                onChange={(date) => onChange({ startFrom: date })}
                placeholder="Any start date"
              />
            </div>
            <div className="flex flex-col gap-2">
              <FieldLabel>Starts on / before</FieldLabel>
              <DatePicker
                value={filters.startTo}
                onChange={(date) => onChange({ startTo: date })}
                placeholder="No limit"
              />
            </div>
          </PopoverContent>
        </Popover>

        {activeCount > 0 ? (
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X />
            Clear ({activeCount})
          </Button>
        ) : null}
      </div>
    </div>
  )
}
