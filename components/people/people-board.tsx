"use client"

import * as React from "react"
import { LayoutGrid, List, SearchX } from "lucide-react"

import {
  people as allPeople,
  cityOptions,
  OTHER_CITY,
  type VenueTier,
  type WorkAuth,
} from "@/lib/people-data"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  PeopleFilters,
  type PeopleFilters as PeopleFiltersState,
} from "@/components/people/people-filters"
import { PersonCard } from "@/components/people/person-card"
import { PersonRow } from "@/components/people/person-row"

type ViewMode = "grid" | "list"

const initialFilters: PeopleFiltersState = {
  search: "",
  department: "all",
  availability: [],
  cities: [],
  availableFrom: undefined,
  availableTo: undefined,
  venueTiers: [],
  workAuth: [],
}

export function PeopleBoard() {
  // Default to the card grid when the user lands on the page.
  const [view, setView] = React.useState<ViewMode>("grid")
  const [filters, setFilters] = React.useState<PeopleFiltersState>(initialFilters)

  function updateFilters(next: Partial<PeopleFiltersState>) {
    setFilters((prev) => ({ ...prev, ...next }))
  }

  const activeCount =
    (filters.search.trim() ? 1 : 0) +
    (filters.department !== "all" ? 1 : 0) +
    (filters.availability.length > 0 ? 1 : 0) +
    (filters.cities.length > 0 ? 1 : 0) +
    (filters.availableFrom || filters.availableTo ? 1 : 0) +
    (filters.venueTiers.length > 0 ? 1 : 0) +
    (filters.workAuth.length > 0 ? 1 : 0)

  const filtered = React.useMemo(() => {
    const query = filters.search.trim().toLowerCase()

    return allPeople.filter((person) => {
      if (query) {
        const haystack =
          `${person.name} ${person.role} ${person.homeBase} ${person.skills.join(" ")}`.toLowerCase()
        if (!haystack.includes(query)) return false
      }
      if (
        filters.department !== "all" &&
        person.department !== filters.department
      ) {
        return false
      }
      if (
        filters.availability.length > 0 &&
        !filters.availability.includes(person.availability)
      ) {
        return false
      }

      // City chips: match selected cities, with "Other…" catching anything
      // not in the predefined cityOptions list.
      if (filters.cities.length > 0) {
        const matchesCity =
          filters.cities.includes(person.city) ||
          (filters.cities.includes(OTHER_CITY) &&
            !cityOptions.includes(person.city))
        if (!matchesCity) return false
      }

      // Available window: keep people whose availability window overlaps the
      // requested range (string comparison is safe for ISO date-only values).
      if (filters.availableFrom && person.availableTo < filters.availableFrom) {
        return false
      }
      if (filters.availableTo && person.availableFrom > filters.availableTo) {
        return false
      }

      // Venue tier / work auth: OR match (person has at least one selected).
      if (
        filters.venueTiers.length > 0 &&
        !filters.venueTiers.some((t) =>
          person.venueTiers.includes(t as VenueTier),
        )
      ) {
        return false
      }
      if (
        filters.workAuth.length > 0 &&
        !filters.workAuth.some((a) => person.workAuth.includes(a as WorkAuth))
      ) {
        return false
      }

      return true
    })
  }, [filters])

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <PeopleFilters
        filters={filters}
        onChange={updateFilters}
        onClear={() => setFilters(initialFilters)}
        activeCount={activeCount}
      />

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            <span className="font-medium text-foreground">{filtered.length}</span>{" "}
            {filtered.length === 1 ? "contact" : "contacts"}
          </p>

          <div className="inline-flex items-center gap-0.5 rounded-full border border-border bg-card p-0.5">
            <Button
              type="button"
              size="icon-sm"
              variant={view === "grid" ? "secondary" : "ghost"}
              onClick={() => setView("grid")}
              aria-pressed={view === "grid"}
              aria-label="Grid view"
            >
              <LayoutGrid />
            </Button>
            <Button
              type="button"
              size="icon-sm"
              variant={view === "list" ? "secondary" : "ghost"}
              onClick={() => setView("list")}
              aria-pressed={view === "list"}
              aria-label="List view"
            >
              <List />
            </Button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
            <SearchX className="size-8 text-muted-foreground" />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">No contacts match your filters</p>
              <p className="text-sm text-muted-foreground">
                Try widening your search or clearing a filter.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFilters(initialFilters)}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div
            className={cn(
              view === "grid"
                ? "grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4"
                : "flex flex-col gap-3",
            )}
          >
            {filtered.map((person) =>
              view === "grid" ? (
                <PersonCard key={person.id} person={person} />
              ) : (
                <PersonRow key={person.id} person={person} />
              ),
            )}
          </div>
        )}
      </div>
    </div>
  )
}
