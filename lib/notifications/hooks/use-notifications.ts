"use client"

import useSWR from "swr"

import { listNotifications } from "@/lib/notifications/actions"
import { notificationsKey } from "@/lib/notifications/swr-keys"

async function fetchNotifications() {
  const result = await listNotifications()
  if (!result.ok) throw new Error(result.error)
  return result.notifications
}

export function useNotifications({ enabled = true }: { enabled?: boolean } = {}) {
  const swr = useSWR(enabled ? notificationsKey : null, fetchNotifications, {
    dedupingInterval: 2000,
    revalidateOnFocus: true,
    refreshInterval: enabled ? 30_000 : 0,
  })

  return {
    ...swr,
    notifications: swr.data ?? [],
    isLoading: swr.isLoading && !swr.data,
  }
}

export { fetchNotifications }
