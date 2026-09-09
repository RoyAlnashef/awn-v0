"use client"

import { useCallback } from "react"
import useSWR, { mutate as globalMutate } from "swr"

import { isUuid } from "@/lib/messages/format"
import { threadKey } from "@/lib/messages/swr-keys"
import {
  fetchThreadPage,
  type ThreadCache,
} from "@/lib/messages/thread-cache"

export function useThread(conversationId: string | null) {
  const key =
    conversationId && isUuid(conversationId)
      ? threadKey(conversationId)
      : null

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    key,
    () => fetchThreadPage(conversationId!),
    {
      dedupingInterval: 2000,
      revalidateOnFocus: false,
    },
  )

  const loadOlder = useCallback(async () => {
    if (!conversationId || !data?.hasMore || !data.oldestCursor) return

    const older = await fetchThreadPage(conversationId, {
      before: data.oldestCursor,
    })

    await mutate(
      {
        messages: [...older.messages, ...data.messages],
        otherLastReadAt: data.otherLastReadAt,
        hasMore: older.hasMore,
        oldestCursor: older.messages[0]?.createdAt ?? data.oldestCursor,
      },
      { revalidate: false },
    )
  }, [conversationId, data, mutate])

  return {
    messages: data?.messages ?? [],
    otherLastReadAt: data?.otherLastReadAt ?? null,
    hasMore: data?.hasMore ?? false,
    isLoading: isLoading && !data,
    isValidating,
    loadOlder,
    mutate,
  }
}

export function prefetchThread(conversationId: string) {
  if (!isUuid(conversationId)) return
  void globalMutate(threadKey(conversationId), () => fetchThreadPage(conversationId))
}

export type { ThreadCache }
