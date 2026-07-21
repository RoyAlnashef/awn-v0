"use client"

import { useEffect, useState } from "react"
import { MessagesSquare, SquarePen } from "lucide-react"

import { type DirectConversation } from "@/lib/messages-data"
import { type Person } from "@/lib/people-data"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { MessagesInbox } from "@/components/messages/messages-inbox"
import { MessageThread } from "@/components/messages/message-thread"
import { NewMessageDrawer } from "@/components/messages/new-message-drawer"
import { useMessages } from "@/components/messages/messages-provider"

export function MessagesView({
  title,
  description,
  initialConversationId,
}: {
  title: string
  description?: string
  initialConversationId?: string
}) {
  const {
    conversations,
    markConversationRead,
    getConversation,
    startConversation,
  } = useMessages()
  const [active, setActive] = useState<DirectConversation | null>(null)
  const [newOpen, setNewOpen] = useState(false)

  function selectConversation(conversation: DirectConversation) {
    if (conversation.unread) {
      markConversationRead(conversation.id)
    }

    setActive(getConversation(conversation.id) ?? conversation)
  }

  function handleStartConversation(person: Person) {
    const conversation = startConversation(person)
    setActive(conversation)
  }

  useEffect(() => {
    if (!initialConversationId) return

    const conversation = conversations.find(
      (c) => c.id === initialConversationId,
    )
    if (!conversation) return

    if (conversation.unread) {
      markConversationRead(initialConversationId)
    }

    setActive(conversation)
  }, [initialConversationId, conversations, markConversationRead])

  const activeConversation = active
    ? (getConversation(active.id) ?? active)
    : null

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      {/* Title bar with the "New" action aligned to the right. */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            {title}
          </h1>
          {description ? (
            <p className="text-sm text-muted-foreground text-pretty">
              {description}
            </p>
          ) : null}
        </div>
        <Button className="shrink-0" onClick={() => setNewOpen(true)}>
          <SquarePen className="size-4" />
          New
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 gap-4 overflow-hidden">
        {/* Left column — inbox navigation, sits on the app background as part
            of the inner page shell (no surrounding panel). */}
        <div
          className={cn(
            "flex w-full min-h-0 flex-col md:w-80 lg:w-96",
            // On mobile, hide the list once a conversation is open.
            activeConversation && "hidden md:flex",
          )}
        >
          <MessagesInbox
            activeId={activeConversation?.id}
            conversations={conversations}
            onSelectConversation={selectConversation}
          />
        </div>

        {/* Right column — thread or empty state, contained in a card-like panel. */}
        <div
          className={cn(
            "min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card",
            activeConversation ? "flex" : "hidden md:flex",
          )}
        >
          {activeConversation ? (
            <MessageThread
              key={activeConversation.id}
              conversation={activeConversation}
              onBack={() => setActive(null)}
            />
          ) : (
            <Empty className="flex-1 border-none">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <MessagesSquare />
                </EmptyMedia>
                <EmptyTitle>Your messages</EmptyTitle>
                <EmptyDescription>
                  Select a conversation from the list, or start a new one to
                  begin chatting.
                </EmptyDescription>
              </EmptyHeader>
              <Button variant="outline" onClick={() => setNewOpen(true)}>
                <SquarePen className="size-4" />
                New message
              </Button>
            </Empty>
          )}
        </div>
      </div>

      <NewMessageDrawer
        open={newOpen}
        onOpenChange={setNewOpen}
        onSelectPerson={handleStartConversation}
      />
    </div>
  )
}
