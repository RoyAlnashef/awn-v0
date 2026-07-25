"use client"

import {
  useCallback,
  useEffect,
  useOptimistic,
  useState,
  useTransition,
} from "react"
import { ArrowLeft, Send } from "lucide-react"
import { mutate as mutateSwr } from "swr"

import type { Room, ThreadMessage } from "@/lib/messages-data"
import { applyLocalReaction } from "@/lib/messages/reactions"
import { isUuid } from "@/lib/messages/format"
import { roomsListKey, roomsUnreadCountKey } from "@/lib/rooms/swr-keys"
import { useRoomThread } from "@/lib/rooms/hooks/use-room-thread"
import {
  markRoomRead,
  sendRoomMessage,
  setRoomMessageReaction,
} from "@/lib/rooms/actions"
import { useRooms } from "@/components/rooms/rooms-provider"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageBubbleWithReactions } from "@/components/messages/message-bubble-with-reactions"
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

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
}

export function RoomThread({
  room,
  onBack,
  onJoin,
  onLeave,
}: {
  room: Room
  onBack?: () => void
  onJoin?: () => void | Promise<void>
  onLeave?: () => void | Promise<void>
}) {
  const { currentUser, setActiveRoomId } = useRooms()
  const Icon = room.icon

  const usesServer = isUuid(room.id)

  const {
    messages: serverMessages,
    isLoading,
    mutate: mutateThread,
  } = useRoomThread(usesServer ? room.id : null)

  const [optimisticMessages, addOptimistic] = useOptimistic<
    ThreadMessage[],
    ThreadMessage
  >(serverMessages, (state, msg) => [...state, msg])

  const [draft, setDraft] = useState("")
  const [isSending, startSend] = useTransition()
  const [pendingAction, setPendingAction] = useState<"join" | "leave" | null>(
    null,
  )

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

  const sendMessage = useCallback(() => {
    if (!room.joined) return
    const text = draft.trim()
    if (!text) return

    if (usesServer) {
      const optimistic: ThreadMessage = {
        id: `optimistic-${Date.now()}`,
        from: "me",
        text,
        time: "Now",
      }

      startSend(async () => {
        addOptimistic(optimistic)
        setDraft("")

        const result = await sendRoomMessage(room.id, text)
        if (result.ok) {
          await mutateThread(
            (current) => {
              if (!current) return current
              return {
                ...current,
                messages: current.messages
                  .filter((m) => m.id !== optimistic.id)
                  .concat(result.message),
              }
            },
            { revalidate: false },
          )
        } else {
          // Revert optimistic on error
          await mutateThread()
        }
      })
    } else {
      // Mock path (pre-migration / dev fallback)
      addOptimistic({
        id: `local-${Date.now()}`,
        from: "me",
        text,
        time: "Now",
      })
      setDraft("")
    }
  }, [
    room.id,
    room.joined,
    draft,
    usesServer,
    addOptimistic,
    mutateThread,
    startSend,
  ])

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

  const messages = optimisticMessages

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
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground/80">
          <Icon className="size-5" />
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

      <MessageScrollerProvider autoScroll>
        <MessageScroller className="flex-1">
          <MessageScrollerViewport className="px-4">
            <MessageScrollerContent className="gap-4 py-4">
              <MessageScrollerItem messageId="start">
                <Marker variant="separator">
                  <MarkerContent>
                    {isLoading ? "Loading…" : "Recent messages"}
                  </MarkerContent>
                </Marker>
              </MessageScrollerItem>

              {messages.map((message) => {
                const mine = message.from === "me"
                const displayName = mine
                  ? currentUser.name
                  : (message.author ?? "Member")
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
                                ? (currentUser.avatarUrl ?? undefined)
                                : undefined
                            }
                            alt=""
                          />
                          <AvatarFallback>{initials(displayName)}</AvatarFallback>
                        </Avatar>
                      </MessageAvatar>
                      <MessageContent>
                        {!mine && message.author ? (
                          <p className="mb-0.5 text-xs font-medium text-muted-foreground">
                            {message.author}
                          </p>
                        ) : null}
                        <MessageBubbleWithReactions
                          variant={mine ? "default" : "muted"}
                          align={mine ? "end" : "start"}
                          reactions={message.reactions}
                          onReact={(emoji) => handleReact(message.id, emoji)}
                        >
                          {message.text}
                        </MessageBubbleWithReactions>
                        <MessageFooter>{message.time}</MessageFooter>
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                )
              })}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>

      {room.joined ? (
        <div className="shrink-0 border-t p-3">
          <InputGroup>
            <InputGroupTextarea
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
                disabled={!draft.trim() || isSending}
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
    </div>
  )
}
