"use client"

import { useCallback } from "react"
import { mutate as mutateSwr } from "swr"
import { toast } from "sonner"

import {
  archiveConversation,
  deleteConversationForMe,
  markConversationUnread,
  muteConversation,
  unarchiveConversation,
  unmuteConversation,
} from "@/lib/messages/actions"
import {
  archivedCountKey,
  inboxKey,
  unreadCountKey,
} from "@/lib/messages/swr-keys"

import { useMessages } from "@/components/messages/messages-provider"

function revalidateInboxLists() {
  void mutateSwr(inboxKey(false))
  void mutateSwr(inboxKey(true))
  void mutateSwr(archivedCountKey)
  void mutateSwr(unreadCountKey)
}

export function useConversationInboxActions() {
  const { registerSkipAutoRead, removeConversationFromInbox } = useMessages()

  const toggleMute = useCallback(
    async (conversationId: string, muted: boolean) => {
      const result = muted
        ? await unmuteConversation(conversationId)
        : await muteConversation(conversationId)
      if (!result.ok) {
        toast.error(result.error)
        return result
      }
      revalidateInboxLists()
      return result
    },
    [],
  )

  const toggleArchive = useCallback(
    async (conversationId: string, archived: boolean) => {
      const result = archived
        ? await unarchiveConversation(conversationId)
        : await archiveConversation(conversationId)
      if (!result.ok) {
        toast.error(result.error)
        return result
      }
      revalidateInboxLists()
      return result
    },
    [],
  )

  const markUnread = useCallback(
    async (conversationId: string, isActiveThread: boolean) => {
      const result = await markConversationUnread(conversationId)
      if (!result.ok) {
        toast.error(result.error)
        return result
      }
      if (isActiveThread) {
        registerSkipAutoRead(conversationId)
      }
      revalidateInboxLists()
      return result
    },
    [registerSkipAutoRead],
  )

  const deleteForMe = useCallback(
    async (conversationId: string) => {
      const result = await deleteConversationForMe(conversationId)
      if (!result.ok) {
        toast.error(result.error)
        return result
      }
      removeConversationFromInbox(conversationId)
      revalidateInboxLists()
      return result
    },
    [removeConversationFromInbox],
  )

  return {
    toggleMute,
    toggleArchive,
    markUnread,
    deleteForMe,
    revalidateInboxLists,
  }
}
