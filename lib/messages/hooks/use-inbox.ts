"use client"

import { useLayoutEffect } from "react"
import useSWR from "swr"

import { useMessages } from "@/components/messages/messages-provider"
import { listConversations } from "@/lib/messages/actions"
import { inboxKey } from "@/lib/messages/swr-keys"

async function fetchInbox(archived: boolean) {
  const result = await listConversations({ archived })
  if (!result.ok) throw new Error(result.error)
  return result.conversations
}

export function useInbox({
  enabled = true,
  archived = false,
}: { enabled?: boolean; archived?: boolean } = {}) {
  const { syncConversationsFromInbox } = useMessages()
  const key = inboxKey(archived)

  const swr = useSWR(enabled ? key : null, () => fetchInbox(archived), {
    dedupingInterval: 2000,
    revalidateOnFocus: true,
    refreshInterval: enabled ? 30_000 : 0,
  })

  useLayoutEffect(() => {
    if (swr.data && !archived) {
      syncConversationsFromInbox(swr.data)
    }
  }, [swr.data, syncConversationsFromInbox, archived])

  return {
    ...swr,
    isLoading: swr.isLoading && !swr.data,
  }
}

export { fetchInbox }
