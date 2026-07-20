"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, Send } from "lucide-react"

import {
  currentUser,
  getRoomThread,
  type Room,
  type ThreadMessage,
} from "@/lib/messages-data"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Bubble, BubbleContent } from "@/components/ui/bubble"
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
}: {
  room: Room
  onBack?: () => void
  onJoin?: () => void
}) {
  const baseThread = useMemo(() => getRoomThread(room), [room])
  const [messages, setMessages] = useState<ThreadMessage[]>(baseThread)
  const [draft, setDraft] = useState("")
  const Icon = room.icon

  useEffect(() => {
    setMessages(baseThread)
    setDraft("")
  }, [baseThread])

  function sendMessage() {
    if (!room.joined) return
    const text = draft.trim()
    if (!text) return
    setMessages((prev) => [
      ...prev,
      {
        id: `${room.id}-local-${prev.length}`,
        from: "me",
        text,
        time: "Now",
      },
    ])
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
        {!room.joined ? (
          <Button size="sm" className="shrink-0" onClick={onJoin}>
            Join room
          </Button>
        ) : null}
      </header>

      <MessageScrollerProvider autoScroll>
        <MessageScroller className="flex-1">
          <MessageScrollerViewport className="px-4">
            <MessageScrollerContent className="gap-4 py-4">
              <MessageScrollerItem messageId="start">
                <Marker variant="separator">
                  <MarkerContent>Recent messages</MarkerContent>
                </Marker>
              </MessageScrollerItem>

              {messages.map((message) => {
                const mine = message.from === "me"
                const displayName = mine
                  ? currentUser.name
                  : message.author ?? "Member"
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
                            src={mine ? currentUser.avatar : undefined}
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
                        <Bubble
                          variant={mine ? "default" : "muted"}
                          align={mine ? "end" : "start"}
                        >
                          <BubbleContent>{message.text}</BubbleContent>
                        </Bubble>
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
                disabled={!draft.trim()}
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
