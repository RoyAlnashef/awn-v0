"use client"

import {
  startTransition,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react"
import { useRouter } from "next/navigation"
import { SquarePen } from "lucide-react"

import { AnimatedIcon } from "@/components/icons/animated-icon"
import { MessageSquareIcon } from "@/components/ui/message-square"

import { parsePersonConversationId } from "@/lib/messages/format"
import {
  type DirectConversation,
  type MessageableMember,
} from "@/lib/messages-data"
import { getMemberById } from "@/lib/people/actions"
import { cn } from "@/lib/utils"
import { buildPopoutUrl } from "@/lib/popout"
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
import { useHydrated } from "@/hooks/use-hydrated"
import { PopOutButton } from "@/components/popout-button"

export function MessagesView({
  title,
  description,
  initialConversationId,
  initialPersonId,
  initialDraft,
  initialShareJobId,
  initialShareMemberId,
  initialShareLabel,
  initialNewMessage = false,
  popout = false,
  basePath = "/messages",
}: {
  title: string
  description?: string
  initialConversationId?: string
  initialPersonId?: string
  initialDraft?: string
  initialShareJobId?: string
  initialShareMemberId?: string
  initialShareLabel?: string
  initialNewMessage?: boolean
  popout?: boolean
  basePath?: string
}) {
  const router = useRouter()
  const {
    conversations,
    markConversationRead,
    getConversation,
    ensureConversation,
    setActiveConversationId,
  } = useMessages()
  const { isLoading: isInboxLoading } = useInbox({ enabled: true })
  const hydrated = useHydrated()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [active, setActive] = useState<DirectConversation | null>(null)
  const [newOpen, setNewOpen] = useState(false)
  const [composerDraft, setComposerDraft] = useState(initialDraft ?? "")
  const [composerShareJobId, setComposerShareJobId] = useState(
    initialShareJobId ?? "",
  )
  const [composerShareMemberId, setComposerShareMemberId] = useState(
    initialShareMemberId ?? "",
  )
  const [shareLabel, setShareLabel] = useState(initialShareLabel ?? "")
  const composerShareJobIdRef = useRef(composerShareJobId)
  const composerShareMemberIdRef = useRef(composerShareMemberId)
  composerShareJobIdRef.current = composerShareJobId
  composerShareMemberIdRef.current = composerShareMemberId

  useEffect(() => {
    setComposerShareJobId(initialShareJobId ?? "")
  }, [initialShareJobId])

  useEffect(() => {
    setComposerShareMemberId(initialShareMemberId ?? "")
  }, [initialShareMemberId])

  useEffect(() => {
    setShareLabel(initialShareLabel ?? "")
  }, [initialShareLabel])
  const [startError, setStartError] = useState<string | null>(null)
  const resolvingPerson = useRef<string | null>(null)
  const selectionEpochRef = useRef(0)
  const selectedIdRef = useRef<string | null>(null)
  const pendingUrlConversationIdRef = useRef<string | null>(null)
  const lastSyncedUrlIdRef = useRef<string | undefined>(initialConversationId)
  const urlSyncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const supersededUrlIdsRef = useRef(new Set<string>())
  const allowUrlOverrideRef = useRef(false)
  const conversationsRef = useRef(conversations)
  conversationsRef.current = conversations
  const getConversationRef = useRef(getConversation)
  getConversationRef.current = getConversation
  const ensureConversationRef = useRef(ensureConversation)
  ensureConversationRef.current = ensureConversation

  const replaceSearchParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams()
      mutate(params)
      const qs = params.toString()
      router.replace(qs ? `${basePath}?${qs}` : basePath, { scroll: false })
    },
    [router, basePath],
  )

  const cancelScheduledUrlSync = useCallback(() => {
    if (urlSyncTimeoutRef.current) {
      clearTimeout(urlSyncTimeoutRef.current)
      urlSyncTimeoutRef.current = null
    }
  }, [])

  const scheduleUrlSync = useCallback(
    (mutate: (params: URLSearchParams) => void, epoch: number) => {
      cancelScheduledUrlSync()
      urlSyncTimeoutRef.current = setTimeout(() => {
        urlSyncTimeoutRef.current = null
        if (selectionEpochRef.current !== epoch) return

        startTransition(() => {
          replaceSearchParams(mutate)
        })
      }, 100)
    },
    [cancelScheduledUrlSync, replaceSearchParams],
  )

  const applySelection = useCallback(
    (epoch: number, conversation: DirectConversation) => {
      if (selectionEpochRef.current !== epoch) return false

      selectedIdRef.current = conversation.id
      setSelectedId(conversation.id)
      setActive(getConversationRef.current(conversation.id) ?? conversation)
      return true
    },
    [],
  )

  const selectConversation = useCallback(
    (conversation: DirectConversation) => {
      if (conversation.unread) {
        markConversationRead(conversation.id)
      }

      if (selectedIdRef.current && selectedIdRef.current !== conversation.id) {
        supersededUrlIdsRef.current.add(selectedIdRef.current)
      }
      if (pendingUrlConversationIdRef.current) {
        supersededUrlIdsRef.current.add(pendingUrlConversationIdRef.current)
      }
      if (lastSyncedUrlIdRef.current) {
        supersededUrlIdsRef.current.add(lastSyncedUrlIdRef.current)
      }

      const epoch = ++selectionEpochRef.current
      pendingUrlConversationIdRef.current = conversation.id
      applySelection(epoch, conversation)

      scheduleUrlSync((params) => {
        params.set("conversation", conversation.id)
        params.delete("person")
        params.delete("draft")
        params.delete("newMessage")
        if (composerShareJobIdRef.current) {
          params.set("shareJob", composerShareJobIdRef.current)
        } else {
          params.delete("shareJob")
        }
        if (composerShareMemberIdRef.current) {
          params.set("shareMember", composerShareMemberIdRef.current)
        } else {
          params.delete("shareMember")
        }
        if (shareLabel) {
          params.set("shareLabel", shareLabel)
        } else {
          params.delete("shareLabel")
        }
      }, epoch)
    },
    [applySelection, markConversationRead, scheduleUrlSync, shareLabel],
  )

  const clearActiveConversation = useCallback(() => {
    cancelScheduledUrlSync()
    ++selectionEpochRef.current
    pendingUrlConversationIdRef.current = null
    selectedIdRef.current = null
    supersededUrlIdsRef.current.clear()
    setSelectedId(null)
    setActive(null)
    setComposerDraft("")
    setComposerShareJobId("")
    setComposerShareMemberId("")
    setShareLabel("")
    lastSyncedUrlIdRef.current = undefined
    startTransition(() => {
      replaceSearchParams((params) => {
        params.delete("conversation")
        params.delete("person")
        params.delete("draft")
        params.delete("shareJob")
        params.delete("shareMember")
        params.delete("shareLabel")
        params.delete("newMessage")
      })
    })
  }, [cancelScheduledUrlSync, replaceSearchParams])

  useEffect(() => {
    if (!initialNewMessage) return
    if (!initialShareJobId && !initialShareMemberId) return

    setNewOpen(true)
    startTransition(() => {
      replaceSearchParams((params) => {
        if (initialShareJobId) params.set("shareJob", initialShareJobId)
        if (initialShareMemberId) params.set("shareMember", initialShareMemberId)
        if (initialShareLabel) params.set("shareLabel", initialShareLabel)
        if (initialConversationId) {
          params.set("conversation", initialConversationId)
        }
        params.delete("newMessage")
      })
    })
  }, [
    initialNewMessage,
    initialShareJobId,
    initialShareMemberId,
    initialShareLabel,
    initialConversationId,
    replaceSearchParams,
  ])

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
    return () => {
      cancelScheduledUrlSync()
    }
  }, [cancelScheduledUrlSync])

  useEffect(() => {
    function onPopState() {
      allowUrlOverrideRef.current = true
      pendingUrlConversationIdRef.current = null
      supersededUrlIdsRef.current.clear()
      cancelScheduledUrlSync()
    }

    window.addEventListener("popstate", onPopState)
    return () => window.removeEventListener("popstate", onPopState)
  }, [cancelScheduledUrlSync])

  const syncSelectionFromUrl = useCallback(
    (conversationId: string | undefined) => {
      if (!conversationId) {
        if (pendingUrlConversationIdRef.current) {
          return
        }

        if (selectedIdRef.current) {
          return
        }

        if (lastSyncedUrlIdRef.current) {
          lastSyncedUrlIdRef.current = undefined
          pendingUrlConversationIdRef.current = null
          ++selectionEpochRef.current
          selectedIdRef.current = null
          setSelectedId(null)
          setActive(null)
        }
        return
      }

      const pendingId = pendingUrlConversationIdRef.current
      const localSelection = selectedIdRef.current
      const urlOverride = allowUrlOverrideRef.current

      if (urlOverride) {
        allowUrlOverrideRef.current = false
      } else if (localSelection && localSelection !== conversationId) {
        if (pendingId && pendingId !== conversationId) {
          return
        }

        if (supersededUrlIdsRef.current.has(conversationId)) {
          return
        }
      }

      if (pendingId && pendingId !== conversationId) {
        return
      }

      if (supersededUrlIdsRef.current.has(conversationId)) {
        return
      }

      if (pendingId === conversationId) {
        pendingUrlConversationIdRef.current = null
      }

      if (localSelection === conversationId) {
        lastSyncedUrlIdRef.current = conversationId
        supersededUrlIdsRef.current.delete(conversationId)
        return
      }

      lastSyncedUrlIdRef.current = conversationId
      supersededUrlIdsRef.current.delete(conversationId)

      const conversation = conversationsRef.current.find(
        (c) => c.id === conversationId,
      )
      if (conversation) {
        if (conversation.unread) {
          markConversationRead(conversationId)
        }

        const epoch = ++selectionEpochRef.current
        applySelection(epoch, conversation)
        return
      }

      const profileId = parsePersonConversationId(conversationId)
      if (!profileId) return

      const requestEpoch = selectionEpochRef.current
      const targetConversationId = conversationId

      void ensureConversationRef.current({
        id: profileId,
        name: "Member",
        role: "AWN Member",
        homeBase: "",
        online: false,
      }).then((result) => {
        if (selectionEpochRef.current !== requestEpoch) return
        if (lastSyncedUrlIdRef.current !== targetConversationId) return
        if (!result.ok) return
        selectConversation(result.conversation)
      })
    },
    [applySelection, markConversationRead, selectConversation],
  )

  useEffect(() => {
    syncSelectionFromUrl(initialConversationId)
  }, [initialConversationId, syncSelectionFromUrl])

  useEffect(() => {
    if (!initialConversationId) return
    if (selectedIdRef.current) {
      if (selectedIdRef.current !== initialConversationId) {
        return
      }

      lastSyncedUrlIdRef.current = initialConversationId
      return
    }

    syncSelectionFromUrl(initialConversationId)
  }, [conversations, initialConversationId, syncSelectionFromUrl])

  useEffect(() => {
    if (!initialPersonId) return
    if (resolvingPerson.current === initialPersonId) return

    resolvingPerson.current = initialPersonId
    const requestEpoch = selectionEpochRef.current

    void (async () => {
      const memberResult = await getMemberById(initialPersonId)
      const member: MessageableMember = memberResult.ok
        ? {
            id: memberResult.person.id,
            name: memberResult.person.name,
            role: memberResult.person.role,
            homeBase: memberResult.person.homeBase,
            avatar: memberResult.person.avatar,
            online: memberResult.person.availability === "Available Now",
          }
        : {
            id: initialPersonId,
            name: "Member",
            role: "AWN Member",
            homeBase: "",
            online: false,
          }

      const conversation = await ensureConversation(member)
      if (selectionEpochRef.current !== requestEpoch) return
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

  const visibleSelectedId = hydrated
    ? (selectedId ?? activeConversation?.id)
    : null
  const visibleActiveConversation = hydrated ? activeConversation : null

  useEffect(() => {
    setActiveConversationId(activeConversation?.id ?? null)
    return () => setActiveConversationId(null)
  }, [activeConversation?.id, setActiveConversationId])

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
      <div
        className={cn(
          "flex items-start justify-between gap-4",
          visibleActiveConversation && "hidden md:flex",
        )}
      >
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
        <div className="flex shrink-0 items-center gap-2">
          {!popout ? (
            <PopOutButton
              href={buildPopoutUrl(
                "/popout/messages",
                visibleActiveConversation
                  ? { conversation: visibleActiveConversation.id }
                  : undefined,
              )}
              windowName={
                visibleActiveConversation
                  ? `msg-${visibleActiveConversation.id}`
                  : "messages-popout"
              }
              aria-label="Pop out Messages"
            />
          ) : null}
          <Button className="shrink-0" onClick={() => setNewOpen(true)}>
            <SquarePen className="size-4" />
            New
          </Button>
        </div>
      </div>

      {startError ? (
        <p className="text-sm text-destructive">{startError}</p>
      ) : null}

      <div className="flex min-h-0 min-w-0 flex-1 gap-4 overflow-hidden">
        <div
          className={cn(
            "flex w-full min-h-0 shrink-0 flex-col md:w-80 lg:w-96",
            visibleActiveConversation && "hidden md:flex",
          )}
        >
          <MessagesInbox
            activeId={visibleSelectedId ?? undefined}
            conversations={conversations}
            onSelectConversation={selectConversation}
            onPrefetchConversation={prefetchThread}
            onNewMessage={() => setNewOpen(true)}
            isLoading={isInboxLoading}
          />
        </div>

        <div
          className={cn(
            "min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border bg-card",
            visibleActiveConversation ? "flex" : "hidden md:flex",
          )}
        >
          {visibleActiveConversation ? (
            <MessageThread
              key={visibleActiveConversation.id}
              conversation={visibleActiveConversation}
              initialDraft={composerDraft}
              initialShareJobId={
                composerShareMemberId ? undefined : composerShareJobId || undefined
              }
              initialShareMemberId={composerShareMemberId || undefined}
              onDraftConsumed={() => setComposerDraft("")}
              onShareJobConsumed={() => {
                setComposerShareJobId("")
                setShareLabel("")
                startTransition(() => {
                  replaceSearchParams((params) => {
                    if (selectedIdRef.current) {
                      params.set("conversation", selectedIdRef.current)
                    }
                    params.delete("shareJob")
                    params.delete("shareLabel")
                  })
                })
              }}
              onShareMemberConsumed={() => {
                setComposerShareMemberId("")
                setShareLabel("")
                startTransition(() => {
                  replaceSearchParams((params) => {
                    if (selectedIdRef.current) {
                      params.set("conversation", selectedIdRef.current)
                    }
                    params.delete("shareMember")
                    params.delete("shareLabel")
                  })
                })
              }}
              onBack={clearActiveConversation}
            />
          ) : (
            <Empty className="flex-1 border-none">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <AnimatedIcon icon={MessageSquareIcon} size={24} />
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
        shareContext={
          composerShareMemberId && shareLabel
            ? { kind: "member", label: shareLabel }
            : composerShareJobId && shareLabel
              ? { kind: "job", label: shareLabel }
              : undefined
        }
      />
    </div>
  )
}
