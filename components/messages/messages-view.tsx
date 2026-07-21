"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { MessagesSquare, SquarePen } from "lucide-react"

import { parsePersonConversationId } from "@/lib/messages/format"
import {
  getPersonById,
  type DirectConversation,
  type MessageableMember,
} from "@/lib/messages-data"
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
import { useInbox } from "@/lib/messages/hooks/use-inbox"
import { prefetchThread } from "@/lib/messages/hooks/use-thread"

export function MessagesView({
  title,
  description,
  initialConversationId,
  initialPersonId,
  initialDraft,
}: {
  title: string
  description?: string
  initialConversationId?: string
  initialPersonId?: string
  initialDraft?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const {
    conversations,
    markConversationRead,
    getConversation,
    ensureConversation,
  } = useMessages()
  useInbox({ enabled: true })
  const [active, setActive] = useState<DirectConversation | null>(null)
  const [newOpen, setNewOpen] = useState(false)
  const [composerDraft, setComposerDraft] = useState(initialDraft ?? "")
  const [startError, setStartError] = useState<string | null>(null)
  const resolvingPerson = useRef<string | null>(null)

  const replaceSearchParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString())
      mutate(params)
      const qs = params.toString()
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    },
    [pathname, router, searchParams],
  )

  const selectConversation = useCallback(
    (conversation: DirectConversation) => {
      if (conversation.unread) {
        markConversationRead(conversation.id)
      }

      setActive(getConversation(conversation.id) ?? conversation)

      replaceSearchParams((params) => {
        params.set("conversation", conversation.id)
        params.delete("person")
        params.delete("draft")
      })
    },
    [getConversation, markConversationRead, replaceSearchParams],
  )

  const clearActiveConversation = useCallback(() => {
    setActive(null)
    setComposerDraft("")
    replaceSearchParams((params) => {
      params.delete("conversation")
      params.delete("person")
      params.delete("draft")
    })
  }, [replaceSearchParams])

  function handleStartConversation(member: MessageableMember) {
    setStartError(null)
    void ensureConversation(member).then((result) => {
      if (result.ok) {
        selectConversation(result.conversation)
        return
      }
      setStartError(result.error)
    })
  }

  useEffect(() => {
    if (!initialConversationId) return

    const conversation = conversations.find(
      (c) => c.id === initialConversationId,
    )
    if (conversation) {
      if (conversation.unread) {
        markConversationRead(initialConversationId)
      }
      setActive(conversation)
      return
    }

    const profileId = parsePersonConversationId(initialConversationId)
    if (!profileId) return

    void ensureConversation({
      id: profileId,
      name: "Member",
      role: "AWN Member",
      homeBase: "",
      online: false,
    }).then((result) => {
      if (result.ok) selectConversation(result.conversation)
    })
  }, [
    initialConversationId,
    conversations,
    markConversationRead,
    ensureConversation,
    selectConversation,
  ])

  useEffect(() => {
    if (!initialPersonId) return
    if (resolvingPerson.current === initialPersonId) return

    resolvingPerson.current = initialPersonId

    void (async () => {
      const mockPerson = getPersonById(initialPersonId)
      const member: MessageableMember = mockPerson
        ? {
            id: mockPerson.id,
            name: mockPerson.name,
            role: mockPerson.role,
            homeBase: mockPerson.homeBase,
            avatar: mockPerson.avatar,
            online: mockPerson.availability === "Available Now",
          }
        : { id: initialPersonId, name: "Member", role: "AWN Member", homeBase: "", online: false }

      const conversation = await ensureConversation(member)
      if (conversation.ok) {
        selectConversation(conversation.conversation)
      } else {
        setStartError(conversation.error)
      }
    })()
  }, [initialPersonId, ensureConversation, selectConversation])

  const activeConversation = active
    ? (getConversation(active.id) ?? active)
    : null

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
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

      {startError ? (
        <p className="text-sm text-destructive">{startError}</p>
      ) : null}

      <div className="flex min-h-0 flex-1 gap-4 overflow-hidden">
        <div
          className={cn(
            "flex w-full min-h-0 flex-col md:w-80 lg:w-96",
            activeConversation && "hidden md:flex",
          )}
        >
          <MessagesInbox
            activeId={activeConversation?.id}
            conversations={conversations}
            onSelectConversation={selectConversation}
            onPrefetchConversation={prefetchThread}
          />
        </div>

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
              initialDraft={composerDraft}
              onDraftConsumed={() => setComposerDraft("")}
              onBack={clearActiveConversation}
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
        onSelectMember={handleStartConversation}
      />
    </div>
  )
}
