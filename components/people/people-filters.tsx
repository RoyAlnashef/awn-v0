"use client"

import * as React from "react"
import { ChevronDown, Search, X } from "lucide-react"

import { roleGroups } from "@/lib/jobs-data"
import {
  availabilityStatuses,
  availabilityConfig,
  cityOptions as cityOptionsDefault,
  type Availability,
} from "@/lib/people-data"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { MoreFiltersDialog } from "@/components/people/more-filters-dialog"

export interface PeopleFilters {
  search: string
  department: string
  availability: Availability[]
  cities: string[]
  availableFrom?: string
  availableTo?: string
  venueTiers: string[]
  workAuth: string[]
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

export function PeopleFilters({
  filters,
  onChange,
  onClear,
  activeCount,
  cityOptions = cityOptionsDefault,
}: {
  filters: PeopleFilters
  onChange: (next: Partial<PeopleFilters>) => void
  onClear: () => void
  activeCount: number
  cityOptions?: string[]
}) {
  function toggleAvailability(status: Availability) {
    const active = filters.availability.includes(status)
    onChange({
      availability: active
        ? filters.availability.filter((s) => s !== status)
        : [...filters.availability, status],
    })
  }

  const departmentLabel =
    filters.department === "all" ? "Department" : filters.department

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative sm:max-w-xs sm:flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="Search name, role, city…"
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

        {/* Availability */}
        <Popover>
          <PopoverTrigger
            render={
              <FilterButton
                label="Availability"
                count={filters.availability.length}
                active={filters.availability.length > 0}
              />
            }
          />
          <PopoverContent align="start" className="w-64">
            <FieldLabel>Availability</FieldLabel>
            <div className="flex flex-wrap gap-1.5">
              {availabilityStatuses.map((status) => {
                const active = filters.availability.includes(status)
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => toggleAvailability(status)}
                    aria-pressed={active}
                    className={cn(
                      "flex items-center gap-1.5 rounded-md border px-3 py-1 text-xs font-medium transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-input/30 text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "size-2 rounded-full",
                        active ? "bg-primary-foreground" : availabilityConfig[status].dot,
                      )}
                    />
                    {status}
                  </button>
                )
              })}
            </div>
          </PopoverContent>
        </Popover>

        <MoreFiltersDialog filters={filters} onChange={onChange} cityOptions={cityOptions} />

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
