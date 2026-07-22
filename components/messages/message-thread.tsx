"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, Check, CheckCheck, Phone, Send, Video } from "lucide-react"
import {
  isPersistedConversation,
  isUuid,
} from "@/lib/messages/format"
import {
  getOrCreateConversation,
  sendMessage as sendMessageAction,
} from "@/lib/messages/actions"
import { useThread } from "@/lib/messages/hooks/use-thread"
import type { ThreadCache } from "@/lib/messages/thread-cache"
import {
  getThread,
  type DirectConversation,
  type ThreadMessage,
} from "@/lib/messages-data"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Bubble,
  BubbleContent,
} from "@/components/ui/bubble"
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
} from "@/components/ui/message"
import { Marker, MarkerContent } from "@/components/ui/marker"
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { useMessages } from "@/components/messages/messages-provider"
import { MessageThreadSkeleton } from "@/components/messages/message-thread-skeleton"
import { createClient } from "@/lib/supabase/client"

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
}

function ReadReceipt({
  status,
}: {
  status: NonNullable<ThreadMessage["readReceipt"]>
}) {
  if (status === "read") {
    return (
      <CheckCheck
        className="size-3 text-primary"
        aria-label="Read"
      />
    )
  }

  if (status === "delivered") {
    return (
      <CheckCheck
        className="size-3 text-muted-foreground/70"
        aria-label="Delivered"
      />
    )
  }

  return (
    <Check className="size-3 text-muted-foreground/70" aria-label="Sent" />
  )
}

function deriveReadReceipt(
  message: ThreadMessage,
  otherLastReadAt: string | null,
): ThreadMessage["readReceipt"] | undefined {
  if (message.from !== "me") return undefined
  if (message.readReceipt) return message.readReceipt
  if (!message.createdAt) return "sent"
  if (
    otherLastReadAt &&
    new Date(otherLastReadAt) >= new Date(message.createdAt)
  ) {
    return "read"
  }
  return "delivered"
}

export function MessageThread({
  conversation,
  initialDraft,
  onDraftConsumed,
  onBack,
}: {
  conversation: DirectConversation
  initialDraft?: string
  onDraftConsumed?: () => void
  onBack?: () => void
}) {
  const { bumpConversation, currentUser, markConversationRead: markRead } =
    useMessages()
  const [persistedConversationId, setPersistedConversationId] = useState<
    string | null
  >(isUuid(conversation.id) ? conversation.id : null)
  const isPersisted = Boolean(persistedConversationId)
  const baseThread = useMemo(
    () => (isPersisted ? [] : getThread(conversation)),
    [conversation, isPersisted],
  )
  const [localMessages, setLocalMessages] = useState<ThreadMessage[]>(baseThread)
  const [draft, setDraft] = useState(initialDraft ?? "")
  const [sending, setSending] = useState(false)
  const [loadingOlder, setLoadingOlder] = useState(false)

  const {
    messages: cachedMessages,
    otherLastReadAt,
    hasMore,
    isLoading,
    isValidating,
    loadOlder,
    mutate,
  } = useThread(persistedConversationId)

  const messages = isPersisted ? cachedMessages : localMessages

  const isResolvingConversation =
    !isPersisted &&
    isPersistedConversation(conversation) &&
    Boolean(conversation.otherProfileId)

  const isThreadPending =
    isResolvingConversation ||
    (isPersisted && (isLoading || (isValidating && cachedMessages.length === 0)))

  useEffect(() => {
    if (!initialDraft) return
    setDraft(initialDraft)
    onDraftConsumed?.()
  }, [initialDraft, onDraftConsumed])

  useEffect(() => {
    if (isUuid(conversation.id)) {
      setPersistedConversationId(conversation.id)
      return
    }

    if (!isPersistedConversation(conversation) || !conversation.otherProfileId) {
      setPersistedConversationId(null)
      return
    }

    let cancelled = false

    void getOrCreateConversation(conversation.otherProfileId).then((result) => {
      if (cancelled || !result.ok) return
      setPersistedConversationId(result.conversationId)
    })

    return () => {
      cancelled = true
    }
  }, [conversation])

  useEffect(() => {
    if (!isPersisted || !persistedConversationId) {
      setLocalMessages(getThread(conversation))
      return
    }

    markRead(persistedConversationId)
  }, [conversation, isPersisted, markRead, persistedConversationId])

  useEffect(() => {
    if (!isPersisted || !persistedConversationId) return

    const supabase = createClient()
    const channel = supabase
      .channel(`dm-read-receipts:${persistedConversationId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "dm_participants",
          filter: `conversation_id=eq.${persistedConversationId}`,
        },
        (payload) => {
          const row = payload.new as {
            profile_id: string
            last_read_at: string | null
          }
          if (row.profile_id === currentUser.id) return

          void mutate(
            (current) =>
              current
                ? { ...current, otherLastReadAt: row.last_read_at }
                : current,
            { revalidate: false },
          )
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [currentUser.id, isPersisted, mutate, persistedConversationId])

  async function handleLoadOlder() {
    if (loadingOlder) return
    setLoadingOlder(true)
    try {
      await loadOlder()
    } finally {
      setLoadingOlder(false)
    }
  }

  async function sendMessage() {
    const text = draft.trim()
    if (!text || sending) return

    if (isPersisted && persistedConversationId) {
      const optimisticId = `optimistic-${Date.now()}`
      const optimisticMessage: ThreadMessage = {
        id: optimisticId,
        from: "me",
        text,
        time: "Now",
        readReceipt: "sent",
      }

      void mutate(
        (current: ThreadCache | undefined) => ({
          messages: [...(current?.messages ?? []), optimisticMessage],
          otherLastReadAt: current?.otherLastReadAt ?? null,
          hasMore: current?.hasMore ?? false,
          oldestCursor: current?.oldestCursor ?? null,
        }),
        { revalidate: false },
      )

      bumpConversation(persistedConversationId, text, { from: "me" })
      setDraft("")
      setSending(true)

      const result = await sendMessageAction(persistedConversationId, text)
      setSending(false)

      if (!result.ok) {
        void mutate(
          (current) =>
            current
              ? {
                  ...current,
                  messages: current.messages.filter(
                    (m) => m.id !== optimisticId,
                  ),
                }
              : current,
          { revalidate: false },
        )
        setDraft(text)
        return
      }

      void mutate(
        (current) =>
          current
            ? {
                ...current,
                messages: current.messages.map((message) =>
                  message.id === optimisticId ? result.message : message,
                ),
              }
            : current,
        { revalidate: false },
      )

      return
    }

    setLocalMessages((prev) => [
      ...prev,
      {
        id: `${conversation.id}-local-${prev.length}`,
        from: "me",
        text,
        time: "Now",
        readReceipt: "delivered",
      },
    ])
    bumpConversation(conversation.id, text, { from: "me" })
    setDraft("")
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex shrink-0 items-center gap-3 border-b p-3">
        {onBack ? (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Back to inbox"
            onClick={onBack}
          >
            <ArrowLeft className="size-5" />
          </Button>
        ) : null}
        <div className="relative shrink-0">
          <Avatar className="size-9">
            <AvatarImage src={conversation.avatar || undefined} alt="" />
            <AvatarFallback>{initials(conversation.name)}</AvatarFallback>
          </Avatar>
          {conversation.online ? (
            <span
              aria-hidden="true"
              className="absolute right-0 bottom-0 size-2.5 rounded-full bg-primary ring-2 ring-background"
            />
          ) : null}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="truncate text-sm font-semibold text-foreground">
            {conversation.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {conversation.online ? "Active now" : conversation.role}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Button variant="ghost" size="icon" aria-label="Start voice call">
            <Phone className="size-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Start video call">
            <Video className="size-5" />
          </Button>
        </div>
      </header>

      <MessageScrollerProvider autoScroll>
        <MessageScroller className="flex-1">
          <MessageScrollerViewport className="px-4">
            <MessageScrollerContent className="gap-4 py-4">
              {isThreadPending ? (
                <MessageThreadSkeleton />
              ) : (
                <>
                  {hasMore ? (
                    <div className="flex justify-center pb-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={loadingOlder}
                        onClick={() => void handleLoadOlder()}
                      >
                        {loadingOlder
                          ? "Loading…"
                          : "Load earlier messages"}
                      </Button>
                    </div>
                  ) : null}

                  <MessageScrollerItem messageId="start">
                    <Marker variant="separator">
                      <MarkerContent>Today</MarkerContent>
                    </Marker>
                  </MessageScrollerItem>

                  {messages.map((message) => {
                    const mine = message.from === "me"
                    const readReceipt = deriveReadReceipt(
                      message,
                      otherLastReadAt,
                    )

                    return (
                      <MessageScrollerItem
                        key={message.id}
                        messageId={message.id}
                        scrollAnchor={mine}
                      >
                        <Message align={mine ? "end" : "start"}>
                          <MessageAvatar>
                            <Avatar className="size-8">
                              <AvatarImage
                                src={
                                  mine
                                    ? currentUser.avatarUrl
                                    : conversation.avatar || undefined
                                }
                                alt=""
                              />
                              <AvatarFallback>
                                {initials(
                                  mine ? currentUser.name : conversation.name,
                                )}
                              </AvatarFallback>
                            </Avatar>
                          </MessageAvatar>
                          <MessageContent>
                            <Bubble
                              variant={mine ? "default" : "muted"}
                              align={mine ? "end" : "start"}
                            >
                              <BubbleContent>{message.text}</BubbleContent>
                            </Bubble>
                            <MessageFooter
                              className={cn(mine && "justify-end gap-1")}
                            >
                              <span>{message.time}</span>
                              {mine && readReceipt ? (
                                <ReadReceipt status={readReceipt} />
                              ) : null}
                            </MessageFooter>
                          </MessageContent>
                        </Message>
                      </MessageScrollerItem>
                    )
                  })}
                </>
              )}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>

      <div className="shrink-0 border-t p-3">
        <InputGroup>
          <InputGroupTextarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={`Message ${conversation.name.split(" ")[0]}…`}
            rows={1}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey &&
                !e.nativeEvent.isComposing &&
                e.keyCode !== 229
              ) {
                e.preventDefault()
                void sendMessage()
              }
            }}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              variant="default"
              size="icon-sm"
              aria-label="Send message"
              disabled={!draft.trim() || sending}
              onClick={() => void sendMessage()}
            >
              <Send />
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
      </div>
    </div>
  )
}
