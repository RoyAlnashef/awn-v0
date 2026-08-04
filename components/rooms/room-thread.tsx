"use client"

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { ArrowLeft, Send } from "lucide-react"
import { mutate as mutateSwr } from "swr"
import { toast } from "sonner"

import {
  getPersonForRoomMessage,
  type Room,
  type ThreadMessage,
} from "@/lib/messages-data"
import { applyLocalReaction } from "@/lib/messages/reactions"
import { isSameRoomMessageGroup } from "@/lib/messages/grouping"
import { isUuid } from "@/lib/messages/format"
import { roomsListKey, roomsUnreadCountKey } from "@/lib/rooms/swr-keys"
import { useNewMessageIds } from "@/lib/messages/hooks/use-new-message-ids"
import { useRoomThread } from "@/lib/rooms/hooks/use-room-thread"
import type { RoomThreadCache } from "@/lib/rooms/thread-cache"
import {
  deleteRoomMessage,
  markRoomRead,
  sendRoomMessage,
  setRoomMessageReaction,
} from "@/lib/rooms/actions"
import { useRooms } from "@/components/rooms/rooms-provider"
import { PersonProfileDrawer } from "@/components/people/person-profile-drawer"
import { PersonShareCard } from "@/components/people/person-share-card"
import { JobShareCard } from "@/components/jobs/job-share-card"
import { getMemberSharePayload } from "@/lib/messages/actions"
import { fetchJob } from "@/lib/jobs/fetch"
import { jobToSharePayload } from "@/lib/messages/job-share"
import type { JobSharePayload, MemberSharePayload } from "@/lib/messages-data"
import type { Person } from "@/lib/people-data"
import { getProfileOnline } from "@/lib/presence/actions"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  MessageBubbleWithReactions,
  MessageJobShareWithReactions,
  MessageMemberShareWithReactions,
} from "@/components/messages/message-bubble-with-reactions"
import { MessageReplyComposer } from "@/components/messages/message-reply-composer"
import { MessageDeleteDialog } from "@/components/messages/message-delete-dialog"
import {
  applyLocalMessageDelete,
  applyMessageDelete,
  canDeleteOwnMessage,
  isLatestMessage,
} from "@/lib/messages/delete"
import {
  buildPendingReplyPayload,
  buildReplySnapshot,
  copyMessageText,
  replyAuthorNameForMessage,
} from "@/lib/messages/reply"
import { MessageThreadScrollButton } from "@/components/messages/message-thread-scroll-button"
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
} from "@/components/ui/message"
import { Marker, MarkerContent } from "@/components/ui/marker"
import {
  MessageScroller,
  MessageScrollerContent,
  MessageScrollerItem,
  useMessageScroller,
} from "@/components/ui/message-scroller"
import {
  MessageAutoScrollProvider,
  MessageAutoScrollViewport,
} from "@/components/messages/message-auto-scroll"
import { LoadOlderMessages } from "@/components/messages/load-older-messages"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group"

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
}

function RoomThreadScrollEffects({
  roomId,
  ready,
  sentScrollToken,
}: {
  roomId: string
  ready: boolean
  sentScrollToken: number
}) {
  const { scrollToEnd } = useMessageScroller()

  useLayoutEffect(() => {
    if (!ready) return
    scrollToEnd({ behavior: "auto" })
  }, [roomId, ready, scrollToEnd])

  useLayoutEffect(() => {
    if (sentScrollToken === 0) return
    scrollToEnd({ behavior: "auto" })
  }, [sentScrollToken, scrollToEnd])

  return null
}

export function RoomThread({
  room,
  initialShareJobId,
  initialShareMemberId,
  onShareJobConsumed,
  onShareMemberConsumed,
  onBack,
  onJoin,
  onLeave,
}: {
  room: Room
  initialShareJobId?: string
  initialShareMemberId?: string
  onShareJobConsumed?: () => void
  onShareMemberConsumed?: () => void
  onBack?: () => void
  onJoin?: () => void | Promise<void>
  onLeave?: () => void | Promise<void>
}) {
  const { currentUser, setActiveRoomId } = useRooms()

  const usesServer = isUuid(room.id)

  const {
    messages: serverMessages,
    hasMore,
    isLoading,
    loadOlder,
    mutate: mutateThread,
  } = useRoomThread(usesServer ? room.id : null)

  const [localMessages, setLocalMessages] = useState<ThreadMessage[]>([])
  const [draft, setDraft] = useState("")
  const [pendingJobShare, setPendingJobShare] =
    useState<JobSharePayload | null>(null)
  const [pendingMemberShare, setPendingMemberShare] =
    useState<MemberSharePayload | null>(null)
  const [pendingReply, setPendingReply] =
    useState<ThreadMessage | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ThreadMessage | null>(null)
  const [deletePending, setDeletePending] = useState(false)
  const composerRef = useRef<HTMLTextAreaElement>(null)
  const [loadingJobShare, setLoadingJobShare] = useState(false)
  const [loadingMemberShare, setLoadingMemberShare] = useState(false)
  const [sending, setSending] = useState(false)
  const [sentScrollToken, setSentScrollToken] = useState(0)
  const [pendingAction, setPendingAction] = useState<"join" | "leave" | null>(
    null,
  )
  const [profileOpen, setProfileOpen] = useState(false)
  const [profilePerson, setProfilePerson] = useState<Person | null>(null)
  const [profileOnline, setProfileOnline] = useState<boolean | undefined>(
    undefined,
  )
  const openProfileIdRef = useRef<string | null>(null)

  function openAuthorProfile(message: ThreadMessage) {
    const person = getPersonForRoomMessage(message)
    if (!person) return

    const profileId = message.authorId
    openProfileIdRef.current = profileId ?? null

    const isFirstMount = profilePerson === null
    setProfilePerson(person)
    setProfileOnline(undefined)

    // Mount closed first so the drawer can animate in (matches People/Messages).
    if (isFirstMount) {
      requestAnimationFrame(() => setProfileOpen(true))
    } else {
      setProfileOpen(true)
    }

    if (!profileId || !isUuid(profileId)) return

    void getProfileOnline(profileId).then((result) => {
      if (result.ok && openProfileIdRef.current === profileId) {
        setProfileOnline(result.online)
      }
    })
  }

  function handleProfileOpenChange(open: boolean) {
    setProfileOpen(open)
    if (!open) {
      openProfileIdRef.current = null
      setProfileOnline(undefined)
    }
  }

  function requestScrollToEnd() {
    setSentScrollToken((token) => token + 1)
  }

  useEffect(() => {
    setPendingAction(null)
  }, [room.id])

  async function handleJoin() {
    if (pendingAction || !onJoin) return
    setPendingAction("join")
    try {
      await onJoin()
    } finally {
      setPendingAction(null)
    }
  }

  async function handleLeave() {
    if (pendingAction || !onLeave) return
    setPendingAction("leave")
    try {
      await onLeave()
    } finally {
      setPendingAction(null)
    }
  }

  // Track active room so realtime bridge can mark messages read correctly
  useEffect(() => {
    if (!usesServer) return
    setActiveRoomId(room.id)
    return () => setActiveRoomId(null)
  }, [room.id, usesServer, setActiveRoomId])

  // Mark room as read when a joined thread is opened
  useEffect(() => {
    if (!usesServer || !room.joined) return
    void markRoomRead(room.id).then(() => {
      void mutateSwr(roomsListKey)
      void mutateSwr(roomsUnreadCountKey)
    })
  }, [room.id, room.joined, usesServer])

  useEffect(() => {
    if (!initialShareMemberId) return

    let cancelled = false
    setLoadingMemberShare(true)

    void getMemberSharePayload(initialShareMemberId)
      .then((result) => {
        if (cancelled) return
        if (result.ok) {
          setPendingMemberShare(result.memberShare)
          setPendingJobShare(null)
        } else {
          setPendingMemberShare(null)
        }
      })
      .finally(() => {
        if (cancelled) return
        setLoadingMemberShare(false)
        onShareMemberConsumed?.()
      })

    return () => {
      cancelled = true
    }
  }, [initialShareMemberId, onShareMemberConsumed])

  useEffect(() => {
    if (!initialShareJobId || initialShareMemberId) return

    let cancelled = false
    setLoadingJobShare(true)

    void fetchJob(initialShareJobId)
      .then((result) => {
        if (cancelled) return
        setPendingJobShare(jobToSharePayload(result.job))
      })
      .catch(() => {
        if (cancelled) return
        setPendingJobShare(null)
      })
      .finally(() => {
        if (cancelled) return
        setLoadingJobShare(false)
        onShareJobConsumed?.()
      })

    return () => {
      cancelled = true
    }
  }, [initialShareJobId, initialShareMemberId, onShareJobConsumed])

  const pendingReplyPayload = useMemo(
    () =>
      pendingReply
        ? buildPendingReplyPayload(
            pendingReply,
            replyAuthorNameForMessage(pendingReply, {
              currentUserName: currentUser.name,
            }),
          )
        : null,
    [pendingReply, currentUser.name],
  )

  function handleReplyToMessage(message: ThreadMessage) {
    setPendingReply(message)
    const composer = composerRef.current
    if (composer) {
      composer.focus()
      composer.scrollIntoView({ block: "nearest" })
    }
  }

  function handleCopyMessage(message: ThreadMessage) {
    const text = copyMessageText(message)
    void navigator.clipboard.writeText(text).then(
      () => toast.success("Copied"),
      () => toast.error("Could not copy text"),
    )
  }

  function handleDeleteRequest(message: ThreadMessage) {
    setDeleteTarget(message)
  }

  async function handleConfirmDelete() {
    if (!deleteTarget || deletePending) return

    const target = deleteTarget
    setDeletePending(true)

    if (pendingReply?.id === target.id) {
      setPendingReply(null)
    }

    if (
      usesServer &&
      isUuid(target.id) &&
      !target.id.startsWith("optimistic-")
    ) {
      const wasLatest = isLatestMessage(messages, target.id)
      let previousCache: RoomThreadCache | undefined

      void mutateThread(
        (current) => {
          previousCache = current
          return current ? applyMessageDelete(current, target.id) : current
        },
        { revalidate: false },
      )

      const result = await deleteRoomMessage(target.id)

      if (!result.ok) {
        void mutateThread(previousCache, { revalidate: false })
        toast.error("Could not delete message")
        setDeletePending(false)
        return
      }

      if (wasLatest) {
        void mutateSwr(roomsListKey)
      }

      toast.success("Message deleted")
      setDeleteTarget(null)
      setDeletePending(false)
      return
    }

    setLocalMessages((prev) => applyLocalMessageDelete(prev, target.id))
    toast.success("Message deleted")
    setDeleteTarget(null)
    setDeletePending(false)
  }

  async function sendMessage() {
    if (!room.joined) return
    const text = draft.trim()
    const jobId = pendingJobShare?.id
    const sharedProfileId = pendingMemberShare?.id
    const replyTarget = pendingReply
    const replySnapshot =
      replyTarget && pendingReplyPayload
        ? buildReplySnapshot(
            replyTarget,
            replyAuthorNameForMessage(replyTarget, {
              currentUserName: currentUser.name,
            }),
          )
        : undefined
    if ((!text && !jobId && !sharedProfileId) || sending) return

    if (usesServer) {
      const optimisticId = `optimistic-${Date.now()}`
      const optimisticMessage: ThreadMessage = {
        id: optimisticId,
        from: "me",
        text,
        time: "Now",
        createdAt: new Date().toISOString(),
        jobShare: pendingJobShare ?? undefined,
        memberShare: pendingMemberShare ?? undefined,
        replyTo: pendingReplyPayload ?? undefined,
      }

      void mutateThread(
        (current: RoomThreadCache | undefined) => ({
          messages: [...(current?.messages ?? []), optimisticMessage],
          hasMore: current?.hasMore ?? false,
          oldestCursor: current?.oldestCursor ?? null,
        }),
        { revalidate: false },
      )

      setDraft("")
      setPendingJobShare(null)
      setPendingMemberShare(null)
      setPendingReply(null)
      setSending(true)
      requestScrollToEnd()

      const result = await sendRoomMessage(
        room.id,
        text,
        {
          ...(jobId ? { jobId } : {}),
          ...(sharedProfileId ? { sharedProfileId } : {}),
          ...(replyTarget
            ? {
                replyToMessageId: replyTarget.id,
                replySnapshot,
              }
            : {}),
        },
      )
      setSending(false)

      if (!result.ok) {
        void mutateThread(
          (current) =>
            current
              ? {
                  ...current,
                  messages: current.messages.filter(
                    (message) => message.id !== optimisticId,
                  ),
                }
              : current,
          { revalidate: false },
        )
        setDraft(text)
        if (jobId && optimisticMessage.jobShare) {
          setPendingJobShare(optimisticMessage.jobShare)
        }
        if (sharedProfileId && optimisticMessage.memberShare) {
          setPendingMemberShare(optimisticMessage.memberShare)
        }
        if (replyTarget) {
          setPendingReply(replyTarget)
        }
        return
      }

      void mutateThread(
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

      requestScrollToEnd()
      return
    }

    setLocalMessages((prev) => [
      ...prev,
      {
        id: `local-${Date.now()}`,
        from: "me",
        text,
        time: "Now",
        createdAt: new Date().toISOString(),
        jobShare: pendingJobShare ?? undefined,
        memberShare: pendingMemberShare ?? undefined,
        replyTo: pendingReplyPayload ?? undefined,
      },
    ])
    setDraft("")
    setPendingJobShare(null)
    setPendingMemberShare(null)
    setPendingReply(null)
    requestScrollToEnd()
  }

  const canSend =
    Boolean(draft.trim() || pendingJobShare || pendingMemberShare) && !sending

  const handleReact = useCallback(
    (messageId: string, emoji: string | null) => {
      if (usesServer) {
        void mutateThread(
          (current) => {
            if (!current) return current
            return {
              ...current,
              messages: applyLocalReaction(current.messages, messageId, emoji, {
                id: currentUser.id,
                name: currentUser.name,
              }),
            }
          },
          { revalidate: false },
        )
        void setRoomMessageReaction(messageId, emoji).then((result) => {
          if (result.ok) {
            void mutateThread(
              (current) => {
                if (!current) return current
                return {
                  ...current,
                  messages: current.messages.map((m) =>
                    m.id === messageId
                      ? { ...m, reactions: result.reactions }
                      : m,
                  ),
                }
              },
              { revalidate: false },
            )
          }
        })
      } else {
        void mutateThread(
          (current) => {
            if (!current) return current
            return {
              ...current,
              messages: applyLocalReaction(current.messages, messageId, emoji, {
                id: currentUser.id,
                name: currentUser.name,
              }),
            }
          },
          { revalidate: false },
        )
      }
    },
    [usesServer, mutateThread, currentUser],
  )

  const messages = usesServer ? serverMessages : localMessages
  const isThreadPending = usesServer && isLoading
  const newMessageIds = useNewMessageIds(
    messages.map((message) => message.id),
    !isThreadPending,
  )
  const threadReady = usesServer ? !isLoading : true

  const handleLoadOlder = useCallback(async () => {
    if (!usesServer) return
    await loadOlder()
  }, [loadOlder, usesServer])

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex shrink-0 items-center gap-3 border-b p-3">
        {onBack ? (
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Back to rooms"
            onClick={onBack}
          >
            <ArrowLeft className="size-5" />
          </Button>
        ) : null}
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-xl leading-none">
          {room.icon}
        </span>
        <div className="flex min-w-0 flex-1 flex-col">
          <p className="truncate text-sm font-semibold text-foreground">
            {room.name}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {room.description}
          </p>
        </div>
        {pendingAction === "join" ? (
          <Button size="sm" className="shrink-0" disabled>
            Joining…
          </Button>
        ) : pendingAction === "leave" ? (
          <Button size="sm" variant="outline" className="shrink-0" disabled>
            Leaving…
          </Button>
        ) : !room.joined ? (
          <Button size="sm" className="shrink-0" onClick={handleJoin}>
            Join
          </Button>
        ) : !room.isDefault ? (
          <Button
            size="sm"
            variant="outline"
            className="shrink-0"
            onClick={handleLeave}
          >
            Leave
          </Button>
        ) : null}
      </header>

      <MessageAutoScrollProvider defaultScrollPosition="end">
        <RoomThreadScrollEffects
          roomId={room.id}
          ready={threadReady}
          sentScrollToken={sentScrollToken}
        />
        <MessageScroller className="flex-1">
          <MessageAutoScrollViewport className="px-4">
            <MessageScrollerContent className="gap-4 py-4">
              {usesServer ? (
                <LoadOlderMessages
                  hasMore={hasMore}
                  onLoadOlder={handleLoadOlder}
                />
              ) : null}

              <MessageScrollerItem messageId="start">
                <Marker variant="separator">
                  <MarkerContent>
                    {isLoading ? "Loading…" : "Recent messages"}
                  </MarkerContent>
                </Marker>
              </MessageScrollerItem>

              {messages.map((message, index) => {
                const mine = message.from === "me"
                const displayName = mine
                  ? currentUser.name
                  : (message.author ?? "Member")
                const previous = messages[index - 1]
                const next = messages[index + 1]
                const continuesPreviousGroup =
                  previous !== undefined &&
                  isSameRoomMessageGroup(previous, message)
                const continuesNextGroup =
                  next !== undefined && isSameRoomMessageGroup(message, next)
                const showAuthor =
                  !mine && message.author && !continuesPreviousGroup
                const showAvatar = !continuesNextGroup
                const showTimestamp = !continuesNextGroup
                const repliedLabel = message.replyTo
                  ? mine
                    ? "You replied"
                    : `${message.author ?? "Member"} replied`
                  : undefined
                const messageActions = {
                  onReply: () => handleReplyToMessage(message),
                  onCopy: () => handleCopyMessage(message),
                  ...(canDeleteOwnMessage(message, usesServer)
                    ? {
                        onDelete: () => handleDeleteRequest(message),
                        deleteLabel: "Delete" as const,
                      }
                    : {}),
                  replyTo: message.replyTo,
                  repliedLabel,
                }
                return (
                  <MessageScrollerItem
                    key={message.id}
                    messageId={message.id}
                    className={cn(
                      continuesPreviousGroup && "-mt-3",
                      newMessageIds.has(message.id) &&
                        "animate-message-enter [content-visibility:visible]",
                    )}
                  >
                    <Message align={mine ? "end" : "start"}>
                      {showAvatar ? (
                        !mine ? (
                          <MessageAvatar>
                            <button
                              type="button"
                              className="cursor-pointer rounded-full focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                              aria-label={`View ${displayName}'s profile`}
                              onClick={() => openAuthorProfile(message)}
                            >
                              <Avatar className="size-8">
                                <AvatarImage
                                  src={message.authorAvatarUrl ?? undefined}
                                  alt=""
                                />
                                <AvatarFallback>
                                  {initials(displayName)}
                                </AvatarFallback>
                              </Avatar>
                            </button>
                          </MessageAvatar>
                        ) : (
                          <MessageAvatar>
                            <Avatar className="size-8">
                              <AvatarImage
                                src={currentUser.avatarUrl ?? undefined}
                                alt=""
                              />
                              <AvatarFallback>
                                {initials(displayName)}
                              </AvatarFallback>
                            </Avatar>
                          </MessageAvatar>
                        )
                      ) : (
                        <div className="w-8 shrink-0" aria-hidden />
                      )}
                      <MessageContent>
                        {message.memberShare ? (
                          <>
                            {showAuthor ? (
                              <button
                                type="button"
                                className={cn(
                                  "mb-1 block w-fit max-w-full text-left text-xs font-semibold leading-tight text-primary hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
                                  mine && "self-end text-right",
                                )}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openAuthorProfile(message)
                                }}
                              >
                                {message.author!}
                              </button>
                            ) : null}
                            <MessageMemberShareWithReactions
                              memberShare={message.memberShare}
                              text={message.text}
                              variant={mine ? "default" : "muted"}
                              align={mine ? "end" : "start"}
                              reactions={message.reactions}
                              onReact={(emoji) =>
                                handleReact(message.id, emoji)
                              }
                              {...messageActions}
                            />
                          </>
                        ) : message.jobShare ? (
                          <>
                            {showAuthor ? (
                              <button
                                type="button"
                                className={cn(
                                  "mb-1 block w-fit max-w-full text-left text-xs font-semibold leading-tight text-primary hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none",
                                  mine && "self-end text-right",
                                )}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openAuthorProfile(message)
                                }}
                              >
                                {message.author!}
                              </button>
                            ) : null}
                            <MessageJobShareWithReactions
                              jobShare={message.jobShare}
                              text={message.text}
                              variant={mine ? "default" : "muted"}
                              align={mine ? "end" : "start"}
                              reactions={message.reactions}
                              onReact={(emoji) =>
                                handleReact(message.id, emoji)
                              }
                              {...messageActions}
                            />
                          </>
                        ) : (
                          <MessageBubbleWithReactions
                            variant={mine ? "default" : "muted"}
                            align={mine ? "end" : "start"}
                            reactions={message.reactions}
                            onReact={(emoji) => handleReact(message.id, emoji)}
                            {...messageActions}
                          >
                            {showAuthor ? (
                              <button
                                type="button"
                                className="mb-0.5 block w-fit max-w-full text-left text-xs font-semibold leading-tight text-primary hover:underline focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  openAuthorProfile(message)
                                }}
                              >
                                {message.author!}
                              </button>
                            ) : null}
                            {message.text}
                          </MessageBubbleWithReactions>
                        )}
                        {showTimestamp ? (
                          <MessageFooter>{message.time}</MessageFooter>
                        ) : null}
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                )
              })}
            </MessageScrollerContent>
          </MessageAutoScrollViewport>
          <MessageThreadScrollButton messages={messages} />
        </MessageScroller>
      </MessageAutoScrollProvider>

      {room.joined ? (
        <div className="shrink-0 border-t p-3">
          {loadingMemberShare ? (
            <p className="mb-2 text-xs text-muted-foreground">
              Loading member attachment…
            </p>
          ) : pendingMemberShare ? (
            <div className="mb-2">
              <PersonShareCard
                memberShare={pendingMemberShare}
                variant="preview"
                onRemove={() => setPendingMemberShare(null)}
              />
            </div>
          ) : loadingJobShare ? (
            <p className="mb-2 text-xs text-muted-foreground">
              Loading job attachment…
            </p>
          ) : pendingJobShare ? (
            <div className="mb-2">
              <JobShareCard
                jobShare={pendingJobShare}
                variant="preview"
                onRemove={() => setPendingJobShare(null)}
              />
            </div>
          ) : null}
          {pendingReplyPayload ? (
            <MessageReplyComposer
              reply={pendingReplyPayload}
              onDismiss={() => setPendingReply(null)}
            />
          ) : null}
          <InputGroup>
            <InputGroupTextarea
              ref={composerRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={`Message ${room.name}…`}
              rows={1}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  !e.nativeEvent.isComposing &&
                  e.keyCode !== 229
                ) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
            />
            <InputGroupAddon align="inline-end">
              <InputGroupButton
                variant="default"
                size="icon-sm"
                aria-label="Send message"
                disabled={!canSend}
                onClick={sendMessage}
              >
                <Send />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
        </div>
      ) : (
        <div
          className={cn(
            "shrink-0 border-t bg-muted/30 p-4",
            "flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left",
          )}
        >
          <p className="flex-1 text-sm text-muted-foreground">
            Join this room to participate in the conversation.
          </p>
          <Button className="shrink-0" onClick={onJoin}>
            Join {room.name}
          </Button>
        </div>
      )}

      {profilePerson ? (
        <PersonProfileDrawer
          person={profilePerson}
          online={profileOnline}
          open={profileOpen}
          onOpenChange={handleProfileOpenChange}
        />
      ) : null}

      <MessageDeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !deletePending) setDeleteTarget(null)
        }}
        variant="delete"
        pending={deletePending}
        onConfirm={() => void handleConfirmDelete()}
      />
    </div>
  )
}
