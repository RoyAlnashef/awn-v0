"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { mutate as mutateSwr } from "swr"

import {
  getOrCreateConversation,
  markConversationRead as markConversationReadAction,
} from "@/lib/messages/actions"
import { isPersistedConversation, isUuid } from "@/lib/messages/format"
import { unreadCountKey } from "@/lib/messages/swr-keys"
import {
  directConversationUnreadCount,
  memberToConversation,
  sortConversationsForInbox,
  type DirectConversation,
  type MessageableMember,
} from "@/lib/messages-data"

export type MessagesCurrentUser = {
  id: string
  name: string
  avatarUrl?: string
}

type EnsureConversationResult =
  | { ok: true; conversation: DirectConversation }
  | { ok: false; error: string }

type MessagesContextValue = {
  conversations: DirectConversation[]
  currentUser: MessagesCurrentUser
  markConversationRead: (id: string) => void
  getConversation: (id: string) => DirectConversation | undefined
  startConversation: (member: MessageableMember) => DirectConversation
  ensureConversation: (member: MessageableMember) => Promise<EnsureConversationResult>
  bumpConversation: (id: string, messageText: string) => void
  upsertConversation: (conversation: DirectConversation) => void
  syncConversationsFromInbox: (conversations: DirectConversation[]) => void
}

const MessagesContext = createContext<MessagesContextValue | null>(null)

function touchActivityOrder(order: string[], id: string) {
  return [id, ...order.filter((conversationId) => conversationId !== id)]
}

export function MessagesProvider({
  children,
  currentUser,
}: {
  children: ReactNode
  currentUser: MessagesCurrentUser
}) {
  const [conversationList, setConversationList] = useState<DirectConversation[]>(
    [],
  )
  const [activityOrder, setActivityOrder] = useState<string[]>([])

  const conversations = useMemo(
    () => sortConversationsForInbox(conversationList, activityOrder),
    [conversationList, activityOrder],
  )

  const syncConversationsFromInbox = useCallback(
    (incoming: DirectConversation[]) => {
      setConversationList((prev) => {
        const byId = new Map(prev.map((c) => [c.id, c]))
        const merged = incoming.map((server) => {
          const local = byId.get(server.id)
          if (!local) return server
          return {
            ...server,
            preview: local.preview.startsWith("You:")
              ? local.preview
              : server.preview,
            time: local.time === "Now" ? local.time : server.time,
            unread: local.unread === false ? false : server.unread,
          }
        })

        for (const local of prev) {
          if (!local.isPersisted && !merged.some((c) => c.id === local.id)) {
            merged.unshift(local)
          }
        }

        return merged
      })

      setActivityOrder((prev) => {
        const serverIds = incoming.map((c) => c.id)
        const localOnly = prev.filter((id) => !serverIds.includes(id))
        return [...localOnly, ...serverIds]
      })
    },
    [],
  )

  const upsertConversation = useCallback((conversation: DirectConversation) => {
    setConversationList((prev) => {
      const withoutLocalStub = conversation.otherProfileId
        ? prev.filter(
            (c) =>
              !(
                c.id !== conversation.id &&
                c.otherProfileId === conversation.otherProfileId &&
                !isPersistedConversation(c)
              ),
          )
        : prev

      const existingIndex = withoutLocalStub.findIndex(
        (c) => c.id === conversation.id,
      )
      if (existingIndex === -1) return [conversation, ...withoutLocalStub]

      const next = [...withoutLocalStub]
      next[existingIndex] = { ...next[existingIndex], ...conversation }
      return next
    })
    setActivityOrder((prev) => touchActivityOrder(prev, conversation.id))
  }, [])

  const markConversationRead = useCallback((id: string) => {
    setConversationList((prev) =>
      prev.map((c) => (c.id === id && c.unread ? { ...c, unread: false } : c)),
    )

    if (isUuid(id)) {
      void markConversationReadAction(id).then(() => {
        void mutateSwr(unreadCountKey)
      })
    }
  }, [])

  const getConversation = useCallback(
    (id: string) => conversationList.find((c) => c.id === id),
    [conversationList],
  )

  const startConversation = useCallback((member: MessageableMember) => {
    let conversation!: DirectConversation

    setConversationList((prev) => {
      const existing = prev.find(
        (c) =>
          c.otherProfileId === member.id ||
          c.name === member.name ||
          c.id === `person-${member.id}`,
      )
      if (existing) {
        conversation = existing
        return prev
      }

      conversation = memberToConversation(member)
      return [conversation, ...prev]
    })

    setActivityOrder((prev) => touchActivityOrder(prev, conversation.id))
    return conversation
  }, [])

  const ensureConversation = useCallback(
    async (member: MessageableMember): Promise<EnsureConversationResult> => {
      const existing = conversationList.find(
        (c) =>
          c.otherProfileId === member.id ||
          c.name === member.name ||
          c.id === `person-${member.id}`,
      )
      if (existing && isPersistedConversation(existing)) {
        return { ok: true, conversation: existing }
      }

      if (isUuid(member.id)) {
        const result = await getOrCreateConversation(member.id)
        if (result.ok) {
          upsertConversation(result.conversation)
          return { ok: true, conversation: result.conversation }
        }
        return { ok: false, error: result.error }
      }

      return { ok: true, conversation: startConversation(member) }
    },
    [conversationList, startConversation, upsertConversation],
  )

  const bumpConversation = useCallback((id: string, messageText: string) => {
    setConversationList((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              preview: `You: ${messageText}`,
              time: "Now",
              isNew: false,
            }
          : c,
      ),
    )
    setActivityOrder((prev) => touchActivityOrder(prev, id))
  }, [])

  return (
    <MessagesContext.Provider
      value={{
        conversations,
        currentUser,
        markConversationRead,
        getConversation,
        startConversation,
        ensureConversation,
        bumpConversation,
        upsertConversation,
        syncConversationsFromInbox,
      }}
    >
      {children}
    </MessagesContext.Provider>
  )
}

export function useMessages() {
  const context = useContext(MessagesContext)
  if (!context) {
    throw new Error("useMessages must be used within a MessagesProvider")
  }
  return context
}
