"use client"

import { useMemo, useState } from "react"
import { ArrowLeft, BellOff, ChevronRight, Search, SquarePen } from "lucide-react"

import { AnimatedIcon } from "@/components/icons/animated-icon"
import { MessageSquareIcon } from "@/components/ui/message-square"
import { ConversationActionsDropdown } from "@/components/messages/conversation-actions-dropdown"

import {
  directConversations,
  type DirectConversation,
} from "@/lib/messages-data"
import { isPersistedConversation } from "@/lib/messages/format"
import { prefetchThread } from "@/lib/messages/hooks/use-thread"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { MessagesInboxSkeleton } from "@/components/messages/messages-inbox-skeleton"

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
}

type InboxActionResult = { ok: true } | { ok: false; error: string }

export function MessagesInbox({
  activeId,
  conversations = directConversations,
  onSelectConversation,
  onPrefetchConversation,
  onNewMessage,
  isLoading = false,
  className,
  inboxMode = "main",
  archivedCount = 0,
  onShowArchived,
  onBackToMain,
  onToggleMute,
  onToggleArchive,
  onMarkUnread,
  onRequestDeleteConversation,
}: {
  activeId?: string
  conversations?: DirectConversation[]
  onSelectConversation?: (conversation: DirectConversation) => void
  onPrefetchConversation?: (conversationId: string) => void
  onNewMessage?: () => void
  isLoading?: boolean
  className?: string
  inboxMode?: "main" | "archived"
  archivedCount?: number
  onShowArchived?: () => void
  onBackToMain?: () => void
  onToggleMute?: (
    conversationId: string,
    muted: boolean,
  ) => Promise<InboxActionResult>
  onToggleArchive?: (
    conversationId: string,
    archived: boolean,
  ) => Promise<InboxActionResult>
  onMarkUnread?: (
    conversationId: string,
    isActiveThread: boolean,
  ) => Promise<InboxActionResult>
  onRequestDeleteConversation?: (conversation: DirectConversation) => void
}) {
  const [query, setQuery] = useState("")
  const showArchivedList = inboxMode === "archived"

  const q = query.trim().toLowerCase()

  const filteredConversations = useMemo(() => {
    if (!q) return conversations
    return conversations.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.preview.toLowerCase().includes(q),
    )
  }, [q, conversations])

  const showArchivedEntry =
    inboxMode === "main" && archivedCount > 0 && onShowArchived && !q

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col gap-0", className)}>
      <div className="flex shrink-0 flex-col gap-3 border-b p-3">
        {showArchivedList && onBackToMain ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="-ml-2 h-8 w-fit justify-start gap-1.5 px-2 text-muted-foreground"
            onClick={onBackToMain}
          >
            <ArrowLeft className="size-4" />
            Back to inbox
          </Button>
        ) : null}
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={
              showArchivedList ? "Search archived…" : "Search messages…"
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        {isLoading ? (
          <MessagesInboxSkeleton />
        ) : (
          <>
            {showArchivedEntry ? (
              <div className="border-b px-2 py-1">
                <Button
                  type="button"
                  variant="ghost"
                  className="h-10 w-full justify-between px-2 font-normal"
                  onClick={onShowArchived}
                >
                  <span className="text-sm">Archived</span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    {archivedCount}
                    <ChevronRight className="size-4" />
                  </span>
                </Button>
              </div>
            ) : null}

            {filteredConversations.length > 0 ? (
              <ul className="flex flex-col">
                {filteredConversations.map((c) => {
                  const active = activeId === c.id
                  const showActions =
                    isPersistedConversation(c) &&
                    (onToggleMute ||
                      onToggleArchive ||
                      onMarkUnread ||
                      onRequestDeleteConversation)

                  return (
                    <li key={c.id}>
                      <div
                        className={cn(
                          "relative flex w-full items-center gap-2 border-b px-4 py-3 last:border-b-0",
                          c.unread && "bg-success/6",
                          active && "bg-accent",
                        )}
                      >
                        {c.unread ? (
                          <span
                            aria-hidden="true"
                            className="absolute inset-y-0 left-0 w-0.5 bg-success"
                          />
                        ) : null}

                        <button
                          type="button"
                          onClick={() => onSelectConversation?.(c)}
                          onMouseEnter={() => {
                            if (isPersistedConversation(c)) {
                              onPrefetchConversation?.(c.id)
                            }
                          }}
                          onFocus={() => {
                            if (isPersistedConversation(c)) {
                              onPrefetchConversation?.(c.id)
                            }
                          }}
                          aria-current={active ? "true" : undefined}
                          className="flex min-w-0 flex-1 items-center gap-3 text-left transition-colors hover:opacity-90"
                        >
                          <Avatar
                            className="size-10 shrink-0"
                            aria-label={
                              c.online ? `${c.name}, online` : c.name
                            }
                          >
                            <AvatarImage src={c.avatar || undefined} alt="" />
                            <AvatarFallback>{initials(c.name)}</AvatarFallback>
                            <AvatarBadge online={c.online} className="size-2.5" />
                          </Avatar>

                          <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
                            <p
                              className={cn(
                                "truncate text-sm",
                                c.unread
                                  ? "font-semibold text-foreground"
                                  : "font-medium text-foreground/90",
                              )}
                            >
                              {c.name}
                            </p>
                            <div className="flex min-w-0 items-center gap-2">
                              <p
                                className={cn(
                                  "min-w-0 truncate text-xs",
                                  c.unread
                                    ? "font-medium text-foreground/80"
                                    : "text-muted-foreground",
                                )}
                              >
                                {c.preview}
                              </p>
                              {c.unread ? (
                                <span
                                  aria-hidden="true"
                                  className="flex h-4 min-w-4 shrink-0 items-center justify-center rounded-full bg-success text-[10px] font-semibold text-success-foreground tabular-nums"
                                >
                                  1
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </button>

                        <div className="flex shrink-0 items-center gap-2.5">
                          <span className="shrink-0 text-[11px] text-muted-foreground/80 tabular-nums">
                            {c.time}
                          </span>
                          {showActions ? (
                            <>
                              {c.muted ? (
                                <BellOff
                                  className="size-3.5 shrink-0 text-muted-foreground/50"
                                  aria-label="Muted"
                                />
                              ) : null}
                              <ConversationActionsDropdown
                                conversation={c}
                                showArchivedList={showArchivedList}
                                isActiveThread={active}
                                onToggleMute={onToggleMute}
                                onToggleArchive={onToggleArchive}
                                onMarkUnread={onMarkUnread}
                                onRequestDelete={onRequestDeleteConversation}
                              />
                            </>
                          ) : null}
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : conversations.length === 0 && !q ? (
              <Empty className="border-none p-6 py-8">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <AnimatedIcon icon={MessageSquareIcon} size={24} />
                  </EmptyMedia>
                  <EmptyTitle>
                    {showArchivedList
                      ? "No archived conversations"
                      : "No conversations yet"}
                  </EmptyTitle>
                  <EmptyDescription>
                    {showArchivedList
                      ? "Archive a conversation from the inbox menu to find it here."
                      : "Start a direct message with someone on AWN to see your conversations here."}
                  </EmptyDescription>
                </EmptyHeader>
                {!showArchivedList && onNewMessage ? (
                  <Button variant="outline" onClick={onNewMessage}>
                    <SquarePen className="size-4" />
                    New message
                  </Button>
                ) : null}
              </Empty>
            ) : (
              <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                No conversations match “{query}”.
              </p>
            )}
          </>
        )}
      </ScrollArea>
    </div>
  )
}
