"use client"

import { useEffect } from "react"
import useSWR from "swr"

import { useMessages } from "@/components/messages/messages-provider"
import { listConversations } from "@/lib/messages/actions"
import { inboxKey } from "@/lib/messages/swr-keys"

async function fetchInbox() {
  const result = await listConversations()
  if (!result.ok) throw new Error(result.error)
  return result.conversations
}

export function useInbox({ enabled = true }: { enabled?: boolean } = {}) {
  const { syncConversationsFromInbox } = useMessages()

  const swr = useSWR(enabled ? inboxKey : null, fetchInbox, {
    dedupingInterval: 2000,
    revalidateOnFocus: false,
  })

  useEffect(() => {
    if (swr.data) {
      syncConversationsFromInbox(swr.data)
    }
  }, [swr.data, syncConversationsFromInbox])

  return swr
}

export { fetchInbox }
