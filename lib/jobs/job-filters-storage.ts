import type { JobFilters } from "@/components/jobs/jobs-filters"
import {
  engagementTypes,
  parseDateOnly,
  roleGroups,
  type EngagementType,
} from "@/lib/jobs-data"
import { toDateOnly } from "@/lib/jobs/format"

const STORAGE_VERSION = "v1"
const STORAGE_KEY = `jobFilters:${STORAGE_VERSION}:jobs`

const VALID_DEPARTMENTS = new Set(
  roleGroups.map((group) => group.department),
)

const VALID_ENGAGEMENTS = new Set<string>(engagementTypes)

export const DEFAULT_JOB_FILTERS: JobFilters = {
  search: "",
  department: "all",
  engagements: [],
  startFrom: undefined,
  startTo: undefined,
  saved: false,
}

interface StoredJobFilters {
  search?: unknown
  department?: unknown
  engagements?: unknown
  startFrom?: unknown
  startTo?: unknown
  saved?: unknown
}

function parseStoredDate(value: unknown): Date | undefined {
  if (typeof value !== "string" || !value) return undefined

  const dateOnly = value.slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) return undefined

  const date = parseDateOnly(dateOnly)
  if (Number.isNaN(date.getTime())) return undefined

  return date
}

function sanitizeStoredFilters(raw: StoredJobFilters): JobFilters {
  const search = typeof raw.search === "string" ? raw.search : ""

  let department = DEFAULT_JOB_FILTERS.department
  if (raw.department === "all") {
    department = "all"
  } else if (
    typeof raw.department === "string" &&
    VALID_DEPARTMENTS.has(raw.department)
  ) {
    department = raw.department
  }

  const engagements = Array.isArray(raw.engagements)
    ? raw.engagements.filter(
        (value): value is EngagementType =>
          typeof value === "string" && VALID_ENGAGEMENTS.has(value),
      )
    : []

  return {
    search,
    department,
    engagements,
    startFrom: parseStoredDate(raw.startFrom),
    startTo: parseStoredDate(raw.startTo),
    saved: raw.saved === true,
  }
}

export function readJobFilters(): JobFilters {
  if (typeof window === "undefined") return DEFAULT_JOB_FILTERS

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return DEFAULT_JOB_FILTERS

    const parsed = JSON.parse(stored) as StoredJobFilters
    return sanitizeStoredFilters(parsed)
  } catch {
    // Private browsing, disabled storage, corrupt JSON, or quota exceeded.
  }

  return DEFAULT_JOB_FILTERS
}

export function writeJobFilters(filters: JobFilters): void {
  if (typeof window === "undefined") return

  try {
    const payload: StoredJobFilters = {
      search: filters.search,
      department: filters.department,
      engagements: filters.engagements,
      startFrom: filters.startFrom ? toDateOnly(filters.startFrom) : undefined,
      startTo: filters.startTo ? toDateOnly(filters.startTo) : undefined,
      saved: filters.saved,
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // Ignore write failures.
  }
}
