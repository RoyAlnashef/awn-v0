"use client"

import useSWR from "swr"

import { getArchivedCount } from "@/lib/messages/actions"
import { archivedCountKey } from "@/lib/messages/swr-keys"

async function fetchArchivedCount() {
  const result = await getArchivedCount()
  if (!result.ok) throw new Error(result.error)
  return result.count
}

export function useArchivedCount({ enabled = true }: { enabled?: boolean } = {}) {
  return useSWR(enabled ? archivedCountKey : null, fetchArchivedCount, {
    dedupingInterval: 5000,
    revalidateOnFocus: true,
  })
}
