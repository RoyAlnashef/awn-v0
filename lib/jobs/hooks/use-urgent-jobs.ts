"use client"

import useSWR from "swr"

import { fetchJobs } from "@/lib/jobs/fetch"
import { urgentJobsKey } from "@/lib/jobs/swr-keys"

export function useUrgentJobs({ enabled = true }: { enabled?: boolean } = {}) {
  const swr = useSWR(enabled ? urgentJobsKey : null, fetchJobs, {
    dedupingInterval: 2000,
    revalidateOnFocus: true,
    refreshInterval: enabled ? 60_000 : 0,
  })

  return {
    ...swr,
    jobs: swr.data?.jobs ?? [],
    isLoading: swr.isLoading && !swr.data,
  }
}
