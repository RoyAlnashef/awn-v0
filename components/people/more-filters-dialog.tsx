"use client"

import * as React from "react"
import { Plane, SlidersHorizontal } from "lucide-react"

import {
  cityOptions as presetCityOptions,
  OTHER_CITY,
  venueTiers,
  workAuthOptions,
} from "@/lib/people-data"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DatePicker,
  parseDateOnly,
  toDateOnly,
} from "@/components/ui/date-picker"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { PeopleFilters } from "@/components/people/people-filters"

function Chip({
  label,
  active,
  icon,
  onClick,
}: {
  label: string
  active: boolean
  icon?: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-input/30 text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {icon}
      {label}
    </button>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
      {children}
    </span>
  )
}

/** Count of the four advanced filter groups that are currently active. */
export function advancedFilterCount(filters: PeopleFilters) {
  return (
    (filters.cities.length > 0 ? 1 : 0) +
    (filters.availableFrom || filters.availableTo ? 1 : 0) +
    (filters.venueTiers.length > 0 ? 1 : 0) +
    (filters.workAuth.length > 0 ? 1 : 0)
  )
}

export function MoreFiltersDialog({
  filters,
  onChange,
  cityOptions: cityOptionsProp,
}: {
  filters: PeopleFilters
  onChange: (next: Partial<PeopleFilters>) => void
  cityOptions?: string[]
}) {
  const cityOptions = cityOptionsProp ?? presetCityOptions
  const count = advancedFilterCount(filters)

  function toggle<T extends string>(list: T[], value: T): T[] {
    return list.includes(value)
      ? list.filter((v) => v !== value)
      : [...list, value]
  }

  function clearAdvanced() {
    onChange({
      cities: [],
      availableFrom: undefined,
      availableTo: undefined,
      venueTiers: [],
      workAuth: [],
    })
  }

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="outline" className="gap-1.5">
            <SlidersHorizontal className="size-3.5" />
            More filters
            {count ? (
              <span className="flex size-4.5 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                {count}
              </span>
            ) : null}
          </Button>
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>More filters</DialogTitle>
          <DialogDescription>
            Narrow the network by location, availability, and credentials.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          {/* City */}
          <div className="flex flex-col gap-2.5">
            <SectionLabel>City</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {cityOptions.map((city) => (
                <Chip
                  key={city}
                  label={city}
                  active={filters.cities.includes(city)}
                  onClick={() =>
                    onChange({ cities: toggle(filters.cities, city) })
                  }
                />
              ))}
              <Chip
                label="Other…"
                active={filters.cities.includes(OTHER_CITY)}
                onClick={() =>
                  onChange({ cities: toggle(filters.cities, OTHER_CITY) })
                }
              />
            </div>
          </div>

          {/* Available window */}
          <div className="flex flex-col gap-2.5">
            <SectionLabel>Available window</SectionLabel>
            <div className="flex items-center gap-3">
              <DatePicker
                value={parseDateOnly(filters.availableFrom)}
                onChange={(date) =>
                  onChange({
                    availableFrom: date ? toDateOnly(date) : undefined,
                  })
                }
                maxDate={parseDateOnly(filters.availableTo)}
                placeholder="From"
                className="min-w-40 flex-1"
              />
              <span className="text-muted-foreground" aria-hidden>
                →
              </span>
              <DatePicker
                value={parseDateOnly(filters.availableTo)}
                onChange={(date) =>
                  onChange({
                    availableTo: date ? toDateOnly(date) : undefined,
                  })
                }
                minDate={parseDateOnly(filters.availableFrom)}
                placeholder="To"
                className="min-w-40 flex-1"
              />
            </div>
          </div>

          {/* Venue tier */}
          <div className="flex flex-col gap-2.5">
            <SectionLabel>Venue tier</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {venueTiers.map((tier) => (
                <Chip
                  key={tier}
                  label={tier}
                  active={filters.venueTiers.includes(tier)}
                  onClick={() =>
                    onChange({ venueTiers: toggle(filters.venueTiers, tier) })
                  }
                />
              ))}
            </div>
          </div>

          {/* Work authorisation */}
          <div className="flex flex-col gap-2.5">
            <SectionLabel>Work authorisation</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {workAuthOptions.map((auth) => (
                <Chip
                  key={auth}
                  label={auth}
                  icon={
                    auth === "Passport" ? (
                      <Plane className="size-3.5" />
                    ) : undefined
                  }
                  active={filters.workAuth.includes(auth)}
                  onClick={() =>
                    onChange({ workAuth: toggle(filters.workAuth, auth) })
                  }
                />
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <Button
            variant="ghost"
            onClick={clearAdvanced}
            disabled={count === 0}
          >
            Clear
          </Button>
          <DialogClose render={<Button>Show results</Button>} />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
