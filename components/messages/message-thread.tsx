"use client"

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, Fragment } from "react"
import { ArrowLeft, Check, CheckCheck, Send } from "lucide-react"
import { toast } from "sonner"
import {
  groupThreadMessagesByDate,
  isPersistedConversation,
  isUuid,
} from "@/lib/messages/format"
import {
  getOrCreateConversation,
  getMemberSharePayload,
  deleteMessage as deleteMessageAction,
  hideMessageForMe as hideMessageForMeAction,
  sendMessage as sendMessageAction,
  setMessageReaction,
} from "@/lib/messages/actions"
import { useThread } from "@/lib/messages/hooks/use-thread"
import { useNewMessageIds } from "@/lib/messages/hooks/use-new-message-ids"
import { useTypingMessageHandoff } from "@/lib/messages/hooks/use-typing-message-handoff"
import { useTypingBroadcast } from "@/lib/messages/hooks/use-typing-indicator"
import {
  applyLocalReaction,
  patchMessageReactions,
} from "@/lib/messages/reactions"
import type { ThreadCache } from "@/lib/messages/thread-cache"
import {
  getThread,
  type DirectConversation,
  type JobSharePayload,
  type MemberSharePayload,
  type MessageReactionTarget,
  type ThreadMessage,
} from "@/lib/messages-data"
import { personFromConversation } from "@/lib/people/fallback-person"
import { getMemberById } from "@/lib/people/actions"
import type { Person, TourCredit } from "@/lib/people-data"
import { PersonProfileDrawer } from "@/components/people/person-profile-drawer"
import { PersonShareCard } from "@/components/people/person-share-card"
import { JobShareCard } from "@/components/jobs/job-share-card"
import { fetchJob } from "@/lib/jobs/fetch"
import { jobToSharePayload } from "@/lib/messages/job-share"
import { messageDisplayPreview } from "@/lib/messages/member-share"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
} from "@/components/ui/message"
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
  applyMessageHide,
  canDeleteOwnMessage,
  canHideReceivedMessage,
  isLatestMessage,
  previewAfterDelete,
} from "@/lib/messages/delete"
import {
  buildPendingReplyPayload,
  buildReplySnapshot,
  copyMessageBody,
  copyMessageText,
  replyAuthorNameForMessage,
} from "@/lib/messages/reply"
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
import { useMessages } from "@/components/messages/messages-provider"
import { MessageThreadModeration } from "@/components/messages/message-thread-moderation"
import { MessageThreadSkeleton } from "@/components/messages/message-thread-skeleton"
import { MessageThreadScrollButton } from "@/components/messages/message-thread-scroll-button"
import { TypingMessageHandoffSlot } from "@/components/messages/typing-message-handoff-slot"
import { mutate as mutateSwr } from "swr"
import { createClient } from "@/lib/supabase/client"
import { inboxKey } from "@/lib/messages/swr-keys"

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

function ScrollToEndAfterSend({ token }: { token: number }) {
  const { scrollToEnd } = useMessageScroller()

  useLayoutEffect(() => {
    if (token === 0) return
    scrollToEnd({ behavior: "auto" })
  }, [scrollToEnd, token])

  return null
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
  initialShareJobId,
  initialShareMemberId,
  onDraftConsumed,
  onShareJobConsumed,
  onShareMemberConsumed,
  onBack,
}: {
  conversation: DirectConversation
  initialDraft?: string
  initialShareJobId?: string
  initialShareMemberId?: string
  onDraftConsumed?: () => void
  onShareJobConsumed?: () => void
  onShareMemberConsumed?: () => void
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
  const [profileOpen, setProfileOpen] = useState(false)
  const [profilePerson, setProfilePerson] = useState<Person>(() =>
    personFromConversation(conversation),
  )
  const [profileTourCredits, setProfileTourCredits] = useState<TourCredit[]>([])

  useEffect(() => {
    setProfilePerson(personFromConversation(conversation))
    setProfileTourCredits([])
  }, [conversation])

  useEffect(() => {
    if (!profileOpen) return
    const profileId = conversation.otherProfileId
    if (!profileId) return

    void getMemberById(profileId).then((result) => {
      if (!result.ok) return
      setProfilePerson(result.person)
      setProfileTourCredits(result.tourCredits)
    })
  }, [profileOpen, conversation.otherProfileId])

  function requestScrollToEnd() {
    setSentScrollToken((token) => token + 1)
  }

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

  const newMessageIds = useNewMessageIds(
    messages.map((message) => message.id),
    !isThreadPending,
  )
  const {
    slotVisible,
    showTyping,
    handoffMessage,
    excludedMessageId,
    isMorphing,
    skipEnterAnimationIds,
  } = useTypingMessageHandoff(
    isPersisted ? persistedConversationId : null,
    currentUser.id,
    messages,
    newMessageIds,
  )
  const { onComposerBlur } = useTypingBroadcast(
    isPersisted ? persistedConversationId : null,
    currentUser.id,
    draft,
    sending,
  )

  const displayMessages = useMemo(
    () =>
      excludedMessageId
        ? messages.filter((message) => message.id !== excludedMessageId)
        : messages,
    [excludedMessageId, messages],
  )
  const messageGroups = useMemo(
    () => groupThreadMessagesByDate(displayMessages),
    [displayMessages],
  )

  useEffect(() => {
    if (!initialDraft) return
    setDraft(initialDraft)
    onDraftConsumed?.()
  }, [initialDraft, onDraftConsumed])

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

  useEffect(() => {
    const conversationId = conversation.id
    const otherProfileId = conversation.otherProfileId

    if (isUuid(conversationId)) {
      setPersistedConversationId(conversationId)
      return
    }

    if (!isPersistedConversation(conversation) || !otherProfileId) {
      setPersistedConversationId(null)
      return
    }

    let cancelled = false

    void getOrCreateConversation(otherProfileId).then((result) => {
      if (cancelled || !result.ok) return
      setPersistedConversationId((current) => {
        if (cancelled) return current
        return result.conversationId
      })
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

  useEffect(() => {
    if (!isPersisted || !persistedConversationId) return

    const supabase = createClient()
    const channel = supabase
      .channel(`dm-reactions:${persistedConversationId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "dm_message_reactions",
        },
        () => {
          void mutate()
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [isPersisted, mutate, persistedConversationId])

  async function handleReact(
    messageId: string,
    emoji: string | null,
    target: MessageReactionTarget = "body",
  ) {
    const reactionUser = { id: currentUser.id, name: currentUser.name }

    if (isPersisted && persistedConversationId) {
      void mutate(
        (current) =>
          current
            ? {
                ...current,
                messages: applyLocalReaction(
                  current.messages,
                  messageId,
                  emoji,
                  reactionUser,
                  target,
                ),
              }
            : current,
        { revalidate: false },
      )

      const result = await setMessageReaction(messageId, emoji, target)
      if (!result.ok) {
        void mutate()
        return
      }

      void mutate(
        (current) =>
          current
            ? patchMessageReactions(
                current,
                messageId,
                result.reactions,
                result.attachmentReactions,
              )
            : current,
        { revalidate: false },
      )
      return
    }

    setLocalMessages((prev) =>
      applyLocalReaction(prev, messageId, emoji, reactionUser, target),
    )
  }

  const handleLoadOlder = useCallback(async () => {
    if (!isPersisted) return
    await loadOlder()
  }, [isPersisted, loadOlder])

  const pendingReplyPayload = useMemo(
    () =>
      pendingReply
        ? buildPendingReplyPayload(
            pendingReply,
            replyAuthorNameForMessage(pendingReply, {
              conversationName: conversation.name,
              currentUserName: currentUser.name,
            }),
          )
        : null,
    [pendingReply, conversation.name, currentUser.name],
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

  function handleCopyMessageBody(text: string) {
    const body = copyMessageBody(text)
    if (!body) return
    void navigator.clipboard.writeText(body).then(
      () => toast.success("Copied"),
      () => toast.error("Could not copy text"),
    )
  }

  function handleDeleteRequest(message: ThreadMessage) {
    setDeleteTarget(message)
  }

  function updateInboxPreviewAfterDelete(
    conversationId: string,
    threadMessages: ThreadMessage[],
    deletedMessageId: string,
  ) {
    if (!isLatestMessage(threadMessages, deletedMessageId)) return

    const previewInfo = previewAfterDelete(threadMessages, deletedMessageId)
    if (!previewInfo) return

    if (!previewInfo.preview.trim()) {
      void mutateSwr(inboxKey(false), undefined, { revalidate: true })
      void mutateSwr(inboxKey(true), undefined, { revalidate: true })
      return
    }

    bumpConversation(conversationId, previewInfo.preview, {
      from: previewInfo.from,
    })
  }

  async function handleConfirmDelete() {
    if (!deleteTarget || deletePending) return

    const target = deleteTarget
    const isHide = target.from === "them"
    setDeletePending(true)

    if (pendingReply?.id === target.id) {
      setPendingReply(null)
    }

    if (
      isPersisted &&
      persistedConversationId &&
      isUuid(target.id) &&
      !target.id.startsWith("optimistic-")
    ) {
      const wasLatest = isLatestMessage(messages, target.id)
      let previousCache: ThreadCache | undefined
      const applyRemoval = isHide ? applyMessageHide : applyMessageDelete

      void mutate(
        (current) => {
          previousCache = current
          return current ? applyRemoval(current, target.id) : current
        },
        { revalidate: false },
      )

      const result = isHide
        ? await hideMessageForMeAction(target.id)
        : await deleteMessageAction(target.id)

      if (!result.ok) {
        void mutate(previousCache, { revalidate: false })
        toast.error(isHide ? "Could not delete message" : "Could not unsend message")
        setDeletePending(false)
        return
      }

      if (wasLatest) {
        updateInboxPreviewAfterDelete(
          persistedConversationId,
          messages,
          target.id,
        )
      }

      toast.success(isHide ? "Message deleted for you" : "Message unsent")
      setDeleteTarget(null)
      setDeletePending(false)
      return
    }

    setLocalMessages((prev) => applyLocalMessageDelete(prev, target.id))
    updateInboxPreviewAfterDelete(conversation.id, localMessages, target.id)
    toast.success(isHide ? "Message deleted for you" : "Message unsent")
    setDeleteTarget(null)
    setDeletePending(false)
  }

  async function sendMessage() {
    const text = draft.trim()
    const jobId = pendingJobShare?.id
    const sharedProfileId = pendingMemberShare?.id
    const replyTarget = pendingReply
    const replySnapshot =
      replyTarget && pendingReplyPayload
        ? buildReplySnapshot(
            replyTarget,
            replyAuthorNameForMessage(replyTarget, {
              conversationName: conversation.name,
              currentUserName: currentUser.name,
            }),
          )
        : undefined
    if ((!text && !jobId && !sharedProfileId) || sending) return

    const preview = messageDisplayPreview(
      text,
      pendingJobShare ?? undefined,
      pendingMemberShare ?? undefined,
    )

    if (isPersisted && persistedConversationId) {
      const optimisticId = `optimistic-${Date.now()}`
      const optimisticMessage: ThreadMessage = {
        id: optimisticId,
        from: "me",
        text,
        time: "Now",
        createdAt: new Date().toISOString(),
        readReceipt: "sent",
        jobShare: pendingJobShare ?? undefined,
        memberShare: pendingMemberShare ?? undefined,
        replyTo: pendingReplyPayload ?? undefined,
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

      bumpConversation(persistedConversationId, preview, { from: "me" })
      setDraft("")
      setPendingJobShare(null)
      setPendingMemberShare(null)
      setPendingReply(null)
      setSending(true)
      requestScrollToEnd()

      const sendOptions = {
        ...(jobId ? { jobId } : {}),
        ...(sharedProfileId ? { sharedProfileId } : {}),
        ...(replyTarget
          ? {
              replyToMessageId: replyTarget.id,
              replySnapshot,
            }
          : {}),
      }

      const result = await sendMessageAction(
        persistedConversationId,
        text,
        Object.keys(sendOptions).length > 0 ? sendOptions : undefined,
      )
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

      requestScrollToEnd()
      return
    }

    setLocalMessages((prev) => [
      ...prev,
      {
        id: `${conversation.id}-local-${prev.length}`,
        from: "me",
        text,
        time: "Now",
        createdAt: new Date().toISOString(),
        readReceipt: "delivered",
        jobShare: pendingJobShare ?? undefined,
        memberShare: pendingMemberShare ?? undefined,
        replyTo: pendingReplyPayload ?? undefined,
      },
    ])
    bumpConversation(conversation.id, preview, { from: "me" })
    setDraft("")
    setPendingJobShare(null)
    setPendingMemberShare(null)
    setPendingReply(null)
    requestScrollToEnd()
  }

  const messagingBlocked = Boolean(conversation.messagingBlocked)

  const canSend =
    !messagingBlocked &&
    Boolean(draft.trim() || pendingJobShare || pendingMemberShare) &&
    !sending

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
        <button
          type="button"
          className="group flex max-w-full min-w-0 shrink cursor-pointer items-center gap-3 rounded-lg text-left focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          aria-label={
            conversation.online
              ? `View ${conversation.name}'s profile, online`
              : `View ${conversation.name}'s profile`
          }
          onClick={() => setProfileOpen(true)}
        >
          <Avatar className="size-9 shrink-0">
            <AvatarImage src={conversation.avatar || undefined} alt="" />
            <AvatarFallback>{initials(conversation.name)}</AvatarFallback>
            <AvatarBadge online={conversation.online} className="size-2.5" />
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <p className="truncate text-sm font-semibold text-foreground group-hover:underline">
              {conversation.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {conversation.online ? "Active now" : conversation.role}
            </p>
          </div>
        </button>
        {isPersistedConversation(conversation) && conversation.otherProfileId ? (
          <div className="ml-auto shrink-0">
            <MessageThreadModeration
              memberId={conversation.otherProfileId}
              memberName={conversation.name}
              onReportOpen={() => setProfileOpen(false)}
              onModerationChange={() => {
                void mutateSwr(inboxKey())
              }}
            />
          </div>
        ) : null}
      </header>

      <PersonProfileDrawer
        person={profilePerson}
        tourCredits={profileTourCredits}
        online={conversation.online}
        open={profileOpen}
        onOpenChange={setProfileOpen}
      />

      <MessageDeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open && !deletePending) setDeleteTarget(null)
        }}
        variant={deleteTarget?.from === "them" ? "hide" : "unsend"}
        pending={deletePending}
        onConfirm={() => void handleConfirmDelete()}
      />

      <MessageAutoScrollProvider>
        <ScrollToEndAfterSend token={sentScrollToken} />
        <MessageScroller className="flex-1">
          <MessageAutoScrollViewport className="px-4">
            <MessageScrollerContent className="gap-4 py-4">
              {isThreadPending ? (
                <MessageThreadSkeleton />
              ) : (
                <>
                  {isPersisted ? (
                    <LoadOlderMessages
                      hasMore={hasMore}
                      onLoadOlder={handleLoadOlder}
                    />
                  ) : null}

                  {messageGroups.map((group) => (
                    <Fragment key={group.key}>
                      <MessageScrollerItem messageId={`date-${group.key}`}>
                        <Marker variant="separator">
                          <MarkerContent>{group.label}</MarkerContent>
                        </Marker>
                      </MessageScrollerItem>

                      {group.messages.map((message) => {
                    const mine = message.from === "me"
                    const readReceipt = deriveReadReceipt(
                      message,
                      otherLastReadAt,
                    )
                    const messageActions = {
                      onReply: () => handleReplyToMessage(message),
                      ...(canDeleteOwnMessage(message, isPersisted)
                        ? {
                            onDelete: () => handleDeleteRequest(message),
                            deleteLabel: "Unsend" as const,
                          }
                        : canHideReceivedMessage(message, isPersisted)
                          ? {
                              onDelete: () => handleDeleteRequest(message),
                              deleteLabel: "Delete" as const,
                            }
                          : {}),
                      replyTo: message.replyTo,
                    }
                    const shareMessageActions = {
                      ...messageActions,
                      ...(message.text.trim()
                        ? { onCopy: () => handleCopyMessageBody(message.text) }
                        : {}),
                    }

                    return (
                      <MessageScrollerItem
                        key={message.id}
                        messageId={message.id}
                        className={cn(
                          newMessageIds.has(message.id) &&
                            !skipEnterAnimationIds.has(message.id) &&
                            "animate-message-enter [content-visibility:visible]",
                        )}
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
                            {message.memberShare ? (
                              <MessageMemberShareWithReactions
                                memberShare={message.memberShare}
                                text={message.text}
                                variant={mine ? "default" : "muted"}
                                align={mine ? "end" : "start"}
                                reactions={message.reactions}
                                attachmentReactions={message.attachmentReactions}
                                onReactBody={(emoji) =>
                                  void handleReact(message.id, emoji, "body")
                                }
                                onReactAttachment={(emoji) =>
                                  void handleReact(message.id, emoji, "attachment")
                                }
                                {...shareMessageActions}
                              />
                            ) : message.jobShare ? (
                              <MessageJobShareWithReactions
                                jobShare={message.jobShare}
                                text={message.text}
                                variant={mine ? "default" : "muted"}
                                align={mine ? "end" : "start"}
                                reactions={message.reactions}
                                attachmentReactions={message.attachmentReactions}
                                onReactBody={(emoji) =>
                                  void handleReact(message.id, emoji, "body")
                                }
                                onReactAttachment={(emoji) =>
                                  void handleReact(message.id, emoji, "attachment")
                                }
                                {...shareMessageActions}
                              />
                            ) : (
                              <MessageBubbleWithReactions
                                variant={mine ? "default" : "muted"}
                                align={mine ? "end" : "start"}
                                reactions={message.reactions}
                                onReact={(emoji) =>
                                  void handleReact(message.id, emoji)
                                }
                                onCopy={() => handleCopyMessage(message)}
                                {...messageActions}
                              >
                                {message.text}
                              </MessageBubbleWithReactions>
                            )}
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
                    </Fragment>
                  ))}

                  <TypingMessageHandoffSlot
                    visible={slotVisible}
                    showTyping={showTyping}
                    isMorphing={isMorphing}
                    name={conversation.name}
                    avatarUrl={conversation.avatar}
                    messageContent={
                      handoffMessage ? (
                        handoffMessage.memberShare ? (
                          <MessageMemberShareWithReactions
                            memberShare={handoffMessage.memberShare}
                            text={handoffMessage.text}
                            variant="muted"
                            align="start"
                            reactions={handoffMessage.reactions}
                            attachmentReactions={handoffMessage.attachmentReactions}
                            onReactBody={(emoji) =>
                              void handleReact(handoffMessage.id, emoji, "body")
                            }
                            onReactAttachment={(emoji) =>
                              void handleReact(
                                handoffMessage.id,
                                emoji,
                                "attachment",
                              )
                            }
                            onReply={() => handleReplyToMessage(handoffMessage)}
                            {...(handoffMessage.text.trim()
                              ? {
                                  onCopy: () =>
                                    handleCopyMessageBody(handoffMessage.text),
                                }
                              : {})}
                            replyTo={handoffMessage.replyTo}
                          />
                        ) : handoffMessage.jobShare ? (
                          <MessageJobShareWithReactions
                            jobShare={handoffMessage.jobShare}
                            text={handoffMessage.text}
                            variant="muted"
                            align="start"
                            reactions={handoffMessage.reactions}
                            attachmentReactions={handoffMessage.attachmentReactions}
                            onReactBody={(emoji) =>
                              void handleReact(handoffMessage.id, emoji, "body")
                            }
                            onReactAttachment={(emoji) =>
                              void handleReact(
                                handoffMessage.id,
                                emoji,
                                "attachment",
                              )
                            }
                            onReply={() => handleReplyToMessage(handoffMessage)}
                            {...(handoffMessage.text.trim()
                              ? {
                                  onCopy: () =>
                                    handleCopyMessageBody(handoffMessage.text),
                                }
                              : {})}
                            replyTo={handoffMessage.replyTo}
                          />
                        ) : (
                          <MessageBubbleWithReactions
                            variant="muted"
                            align="start"
                            reactions={handoffMessage.reactions}
                            onReact={(emoji) =>
                              void handleReact(handoffMessage.id, emoji)
                            }
                            onReply={() => handleReplyToMessage(handoffMessage)}
                            onCopy={() => handleCopyMessage(handoffMessage)}
                            replyTo={handoffMessage.replyTo}
                          >
                            {handoffMessage.text}
                          </MessageBubbleWithReactions>
                        )
                      ) : undefined
                    }
                    messageFooter={
                      handoffMessage ? (
                        <MessageFooter>
                          <span>{handoffMessage.time}</span>
                        </MessageFooter>
                      ) : undefined
                    }
                  />
                </>
              )}
            </MessageScrollerContent>
          </MessageAutoScrollViewport>
          <MessageThreadScrollButton messages={messages} />
        </MessageScroller>
      </MessageAutoScrollProvider>

      <div className="shrink-0 border-t p-3">
        {messagingBlocked ? (
          <p className="mb-2 text-sm text-muted-foreground">
            You can&apos;t message this member. This conversation is view-only.
          </p>
        ) : null}
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
        <InputGroup className={messagingBlocked ? "pointer-events-none opacity-50" : undefined}>
          <InputGroupTextarea
            ref={composerRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={onComposerBlur}
            placeholder={`Message ${conversation.name.split(" ")[0]}…`}
            rows={1}
            disabled={messagingBlocked}
            readOnly={messagingBlocked}
            onKeyDown={(e) => {
              if (messagingBlocked) return
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
              disabled={!canSend}
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
