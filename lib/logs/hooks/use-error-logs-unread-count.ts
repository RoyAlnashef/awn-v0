"use client"

import useSWR from "swr"

import { getNewErrorLogsCount } from "@/lib/logs/actions"
import { getErrorLogsLastSeenAt } from "@/lib/logs/last-seen"
import { errorLogsUnreadCountKey } from "@/lib/logs/swr-keys"

async function fetchNewErrorLogsCount() {
  const since = getErrorLogsLastSeenAt()
  const result = await getNewErrorLogsCount(since)
  if (!result.ok) return 0
  return result.count
}

export function useErrorLogsUnreadCount() {
  const { data, mutate } = useSWR(errorLogsUnreadCountKey, fetchNewErrorLogsCount, {
    dedupingInterval: 5000,
    revalidateOnFocus: true,
  })

  return {
    unreadCount: data ?? 0,
    mutateErrorLogsUnreadCount: mutate,
  }
}

export { fetchNewErrorLogsCount }
