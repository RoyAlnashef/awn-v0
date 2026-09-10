"use client"

import * as React from "react"
import { AnimatedIcon } from "@/components/icons/animated-icon"
import { SearchIcon } from "@/components/ui/search"

import {
  cityOptions as presetCityOptions,
  OTHER_CITY,
  type Person,
  type VenueTier,
  type WorkAuth,
} from "@/lib/people-data"
import { cn } from "@/lib/utils"
import { useBoardViewMode } from "@/hooks/use-board-view-mode"
import { BoardViewToggle } from "@/components/board-view-toggle"
import { Button } from "@/components/ui/button"
import {
  PeopleFilters,
  type PeopleFilters as PeopleFiltersState,
} from "@/components/people/people-filters"
import { PersonCard } from "@/components/people/person-card"
import { PersonRow } from "@/components/people/person-row"

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

export function PeopleBoard({
  initialPeople,
  loadError,
}: {
  initialPeople: Person[]
  loadError: string | null
}) {
  const [view, setView] = useBoardViewMode("people")
  const [filters, setFilters] = React.useState<PeopleFiltersState>(initialFilters)

  const cityOptions = React.useMemo(() => {
    const cities = new Set(presetCityOptions)
    for (const person of initialPeople) {
      if (person.city) cities.add(person.city)
    }
    return [...cities]
  }, [initialPeople])

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

    return initialPeople.filter((person) => {
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

      if (filters.cities.length > 0) {
        const matchesCity =
          filters.cities.includes(person.city) ||
          (filters.cities.includes(OTHER_CITY) &&
            !cityOptions.includes(person.city))
        if (!matchesCity) return false
      }

      if (filters.availableFrom && person.availableTo < filters.availableFrom) {
        return false
      }
      if (filters.availableTo && person.availableFrom > filters.availableTo) {
        return false
      }

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
  }, [filters, initialPeople, cityOptions])

  return (
    <div className="flex min-w-0 flex-col gap-4">
      {loadError ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {loadError}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <PeopleFilters
            filters={filters}
            onChange={updateFilters}
            onClear={() => setFilters(initialFilters)}
            activeCount={activeCount}
            cityOptions={cityOptions}
          />
        </div>
        <div className="shrink-0 self-end sm:self-auto">
          <BoardViewToggle view={view} onViewChange={setView} />
        </div>
      </div>

      {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
            <AnimatedIcon icon={SearchIcon} size={32} className="text-muted-foreground" />
            <div className="flex flex-col gap-1">
              <p className="text-sm font-medium">
                {initialPeople.length === 0
                  ? "No members in the directory yet"
                  : "No contacts match your filters"}
              </p>
              <p className="text-sm text-muted-foreground">
                {initialPeople.length === 0
                  ? "Active member profiles will appear here once they join."
                  : "Try widening your search or clearing a filter."}
              </p>
            </div>
            {initialPeople.length > 0 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters(initialFilters)}
              >
                Clear filters
              </Button>
            ) : null}
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
  )
}
