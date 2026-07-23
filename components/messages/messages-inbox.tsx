"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"

import {
  directConversations,
  type DirectConversation,
} from "@/lib/messages-data"
import { isPersistedConversation } from "@/lib/messages/format"
import { prefetchThread } from "@/lib/messages/hooks/use-thread"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
}

export function MessagesInbox({
  activeId,
  conversations = directConversations,
  onSelectConversation,
  onPrefetchConversation,
  className,
}: {
  activeId?: string
  conversations?: DirectConversation[]
  onSelectConversation?: (conversation: DirectConversation) => void
  onPrefetchConversation?: (conversationId: string) => void
  className?: string
}) {
  const [query, setQuery] = useState("")

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

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col gap-0", className)}>
      <div className="flex shrink-0 flex-col gap-3 border-b p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search messages…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <ScrollArea className="min-h-0 flex-1">
        {filteredConversations.length > 0 ? (
          <ul className="flex flex-col">
            {filteredConversations.map((c) => {
              const active = activeId === c.id
              return (
                <li key={c.id}>
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
                    className={cn(
                      "relative flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-accent/60",
                      c.unread && "bg-primary/6",
                      active && "bg-accent",
                    )}
                  >
                    {c.unread ? (
                      <span
                        aria-hidden="true"
                        className="absolute inset-y-0 left-0 w-0.5 bg-primary"
                      />
                    ) : null}

                    <Avatar
                      className="size-10 shrink-0"
                      aria-label={c.online ? `${c.name}, online` : c.name}
                    >
                      <AvatarImage src={c.avatar || undefined} alt="" />
                      <AvatarFallback>{initials(c.name)}</AvatarFallback>
                      <AvatarBadge online={c.online} className="size-2.5" />
                    </Avatar>

                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <div className="flex items-center justify-between gap-2">
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
                        <span className="shrink-0 text-[11px] text-muted-foreground/80">
                          {c.time}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={cn(
                            "truncate text-xs",
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
                            className="size-2 shrink-0 rounded-full bg-primary"
                          />
                        ) : null}
                      </div>
                    </div>
                  </button>
                </li>
              )
            })}
          </ul>
        ) : (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            No conversations match “{query}”.
          </p>
        )}
      </ScrollArea>
    </div>
  )
}
