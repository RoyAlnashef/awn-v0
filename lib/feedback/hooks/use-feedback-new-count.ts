"use client"

import useSWR, { mutate as globalMutate } from "swr"

import { getFeedbackNewCount } from "@/lib/feedback/actions"
import { feedbackNewCountKey } from "@/lib/feedback/swr-keys"

async function fetchFeedbackNewCount() {
  const result = await getFeedbackNewCount()
  if (!result.ok) throw new Error(result.error)
  return result.count
}

export function useFeedbackNewCount(enabled: boolean) {
  const { data } = useSWR(
    enabled ? feedbackNewCountKey : null,
    fetchFeedbackNewCount,
    {
      dedupingInterval: 5000,
      revalidateOnFocus: true,
    },
  )

  return { newCount: data ?? 0 }
}

export function mutateFeedbackNewCount() {
  return globalMutate(feedbackNewCountKey)
}

export { fetchFeedbackNewCount }
