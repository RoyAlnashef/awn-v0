"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import {
  directConversationUnreadCount,
  directConversations as initialConversations,
  personToConversation,
  sortConversationsForInbox,
  type DirectConversation,
} from "@/lib/messages-data"
import { type Person } from "@/lib/people-data"

type MessagesContextValue = {
  conversations: DirectConversation[]
  unreadCount: number
  markConversationRead: (id: string) => void
  getConversation: (id: string) => DirectConversation | undefined
  startConversation: (person: Person) => DirectConversation
  bumpConversation: (id: string, messageText: string) => void
}

const MessagesContext = createContext<MessagesContextValue | null>(null)

function touchActivityOrder(order: string[], id: string) {
  return [id, ...order.filter((conversationId) => conversationId !== id)]
}

export function MessagesProvider({ children }: { children: ReactNode }) {
  const [conversationList, setConversationList] =
    useState<DirectConversation[]>(initialConversations)
  const [activityOrder, setActivityOrder] = useState<string[]>(() =>
    initialConversations.map((c) => c.id),
  )

  const conversations = useMemo(
    () => sortConversationsForInbox(conversationList, activityOrder),
    [conversationList, activityOrder],
  )

  const unreadCount = directConversationUnreadCount(conversationList)

  const markConversationRead = useCallback((id: string) => {
    setConversationList((prev) =>
      prev.map((c) => (c.id === id && c.unread ? { ...c, unread: false } : c)),
    )
  }, [])

  const getConversation = useCallback(
    (id: string) => conversationList.find((c) => c.id === id),
    [conversationList],
  )

  const startConversation = useCallback((person: Person) => {
    let conversation!: DirectConversation

    setConversationList((prev) => {
      const existing = prev.find((c) => c.name === person.name)
      if (existing) {
        conversation = existing
        return prev
      }

      conversation = personToConversation(person)
      return [conversation, ...prev]
    })

    setActivityOrder((prev) => touchActivityOrder(prev, conversation.id))
    return conversation
  }, [])

  const bumpConversation = useCallback((id: string, messageText: string) => {
    setConversationList((prev) =>
      prev.map((c) =>
        c.id === id
          ? { ...c, preview: `You: ${messageText}`, time: "Now" }
          : c,
      ),
    )
    setActivityOrder((prev) => touchActivityOrder(prev, id))
  }, [])

  return (
    <MessagesContext.Provider
      value={{
        conversations,
        unreadCount,
        markConversationRead,
        getConversation,
        startConversation,
        bumpConversation,
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
