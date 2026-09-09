"use client"

import * as React from "react"
import { ChevronDown, Search, X } from "lucide-react"

import {
  applicationStatusConfig,
  MEMBERSHIP_APPLICATION_SOURCES,
  MEMBERSHIP_APPLICATION_STATUSES,
  type MembershipApplicationSource,
  type MembershipApplicationStatus,
} from "@/lib/invites/data"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export interface ApplicationFilters {
  search: string
  statuses: MembershipApplicationStatus[]
  sources: MembershipApplicationSource[]
}

const applicationSourceConfig: Record<
  MembershipApplicationSource,
  { label: string }
> = {
  request_access: { label: "Signups" },
  invite: { label: "Invites" },
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

export function getApplicationFilterCount(filters: ApplicationFilters): number {
  return filters.statuses.length + filters.sources.length
}

export function ApplicationsFilters({
  filters,
  onChange,
  onClear,
  activeCount,
}: {
  filters: ApplicationFilters
  onChange: (next: Partial<ApplicationFilters>) => void
  onClear: () => void
  activeCount: number
}) {
  function toggleStatus(status: MembershipApplicationStatus) {
    const active = filters.statuses.includes(status)
    onChange({
      statuses: active
        ? filters.statuses.filter((value) => value !== status)
        : [...filters.statuses, status],
    })
  }

  function toggleSource(source: MembershipApplicationSource) {
    const active = filters.sources.includes(source)
    onChange({
      sources: active
        ? filters.sources.filter((value) => value !== source)
        : [...filters.sources, source],
    })
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative sm:max-w-xs sm:flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="Search applicants, source…"
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Popover>
          <PopoverTrigger
            render={
              <FilterButton
                label="Source"
                count={filters.sources.length}
                active={filters.sources.length > 0}
              />
            }
          />
          <PopoverContent align="start" className="w-64">
            <FieldLabel>Source</FieldLabel>
            <div className="flex flex-wrap gap-1.5">
              {MEMBERSHIP_APPLICATION_SOURCES.map((source) => {
                const active = filters.sources.includes(source)
                return (
                  <button
                    key={source}
                    type="button"
                    onClick={() => toggleSource(source)}
                    aria-pressed={active}
                    className={cn(
                      "rounded-md border px-3 py-1 text-xs font-medium transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-input/30 text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {applicationSourceConfig[source].label}
                  </button>
                )
              })}
            </div>
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger
            render={
              <FilterButton
                label="Status"
                count={filters.statuses.length}
                active={filters.statuses.length > 0}
              />
            }
          />
          <PopoverContent align="start" className="w-64">
            <FieldLabel>Status</FieldLabel>
            <div className="flex flex-wrap gap-1.5">
              {MEMBERSHIP_APPLICATION_STATUSES.map((status) => {
                const active = filters.statuses.includes(status)
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => toggleStatus(status)}
                    aria-pressed={active}
                    className={cn(
                      "rounded-md border px-3 py-1 text-xs font-medium transition-colors",
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-input/30 text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    {applicationStatusConfig[status].label}
                  </button>
                )
              })}
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
