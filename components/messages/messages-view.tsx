"use client"

import { useState } from "react"
import { MessagesSquare, SquarePen } from "lucide-react"

import {
  directConversations,
  personToConversation,
  type DirectConversation,
} from "@/lib/messages-data"
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

export function MessagesView({
  title,
  description,
}: {
  title: string
  description?: string
}) {
  const [conversations, setConversations] =
    useState<DirectConversation[]>(directConversations)
  const [active, setActive] = useState<DirectConversation | null>(null)
  const [newOpen, setNewOpen] = useState(false)

  function startConversation(person: Person) {
    // Reuse an existing conversation with this person when one exists,
    // otherwise create a fresh one and drop it at the top of the list.
    const existing = conversations.find((c) => c.name === person.name)
    if (existing) {
      setActive(existing)
      return
    }

    const conversation = personToConversation(person)
    setConversations((prev) => [conversation, ...prev])
    setActive(conversation)
  }

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
            active && "hidden md:flex",
          )}
        >
          <MessagesInbox
            activeId={active?.id}
            conversations={conversations}
            onSelectConversation={setActive}
          />
        </div>

        {/* Right column — thread or empty state, contained in a card-like panel. */}
        <div
          className={cn(
            "min-h-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card",
            active ? "flex" : "hidden md:flex",
          )}
        >
          {active ? (
            <MessageThread
              key={active.id}
              conversation={active}
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
        onSelectPerson={startConversation}
      />
    </div>
  )
}
