"use client"

import useSWR from "swr"

import { getUnreadCount } from "@/lib/messages/actions"
import { unreadCountKey } from "@/lib/messages/swr-keys"

async function fetchUnreadCount() {
  const result = await getUnreadCount()
  if (!result.ok) throw new Error(result.error)
  return result.count
}

export function useUnreadCount() {
  const { data, mutate } = useSWR(unreadCountKey, fetchUnreadCount, {
    dedupingInterval: 5000,
    revalidateOnFocus: true,
  })

  return {
    unreadCount: data ?? 0,
    mutateUnreadCount: mutate,
  }
}

export { fetchUnreadCount }
