"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, Phone, Send, Video } from "lucide-react"

import {
  currentUser,
  getThread,
  type DirectConversation,
  type ThreadMessage,
} from "@/lib/messages-data"
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

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
}

export function MessageThread({
  conversation,
  onBack,
}: {
  conversation: DirectConversation
  onBack?: () => void
}) {
  const { bumpConversation } = useMessages()
  const baseThread = useMemo(() => getThread(conversation), [conversation])
  const [messages, setMessages] = useState<ThreadMessage[]>(baseThread)
  const [draft, setDraft] = useState("")

  // Reset the transcript whenever a different conversation is opened.
  useEffect(() => {
    setMessages(baseThread)
    setDraft("")
  }, [baseThread])

  function sendMessage() {
    const text = draft.trim()
    if (!text) return
    setMessages((prev) => [
      ...prev,
      {
        id: `${conversation.id}-local-${prev.length}`,
        from: "me",
        text,
        time: "Now",
      },
    ])
    bumpConversation(conversation.id, text)
    setDraft("")
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {/* Thread header */}
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

      {/* Transcript */}
      <MessageScrollerProvider autoScroll>
        <MessageScroller className="flex-1">
          <MessageScrollerViewport className="px-4">
            <MessageScrollerContent className="gap-4 py-4">
              <MessageScrollerItem messageId="start">
                <Marker variant="separator">
                  <MarkerContent>Today</MarkerContent>
                </Marker>
              </MessageScrollerItem>

              {messages.map((message) => {
                const mine = message.from === "me"
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
                                ? currentUser.avatar
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

      {/* Composer */}
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
    </div>
  )
}
