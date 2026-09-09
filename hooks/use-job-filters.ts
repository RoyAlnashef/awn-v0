"use client"

import * as React from "react"

import type { JobFilters } from "@/components/jobs/jobs-filters"
import {
  DEFAULT_JOB_FILTERS,
  readJobFilters,
  writeJobFilters,
} from "@/lib/jobs/job-filters-storage"

const listeners = new Set<() => void>()
let snapshot: JobFilters = DEFAULT_JOB_FILTERS
let initialized = false

function refreshSnapshot() {
  snapshot = readJobFilters()
}

function subscribe(listener: () => void) {
  listeners.add(listener)

  function onStorage(event: StorageEvent) {
    if (event.key?.startsWith("jobFilters:")) {
      refreshSnapshot()
      listener()
    }
  }

  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", onStorage)
  }
}

function emitChange() {
  refreshSnapshot()
  for (const listener of listeners) {
    listener()
  }
}

function getSnapshot(): JobFilters {
  if (typeof window !== "undefined" && !initialized) {
    initialized = true
    refreshSnapshot()
  }

  return snapshot
}

export function useJobFilters(): [
  JobFilters,
  (next: Partial<JobFilters>) => void,
  () => void,
] {
  const filters = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    (): JobFilters => DEFAULT_JOB_FILTERS,
  )

  const updateFilters = React.useCallback((next: Partial<JobFilters>) => {
    writeJobFilters({ ...readJobFilters(), ...next })
    emitChange()
  }, [])

  const clearFilters = React.useCallback(() => {
    writeJobFilters(DEFAULT_JOB_FILTERS)
    emitChange()
  }, [])

  return [filters, updateFilters, clearFilters]
}
