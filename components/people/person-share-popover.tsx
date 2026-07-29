"use client"

import { useMemo, useState, type ReactElement } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

import { useMessages } from "@/components/messages/messages-provider"
import { personToSharePayload } from "@/lib/messages/member-share"
import type { DirectConversation } from "@/lib/messages-data"
import type { Person } from "@/lib/people-data"
import { useInbox } from "@/lib/messages/hooks/use-inbox"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Avatar,
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

export function PersonSharePopover({
  person,
  children,
}: {
  person: Person
  children: ReactElement
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const { conversations } = useMessages()
  const { isLoading: inboxLoading } = useInbox({ enabled: open })

  const q = query.trim().toLowerCase()

  const filteredConversations = useMemo(() => {
    if (!q) return conversations
    return conversations.filter(
      (conversation) =>
        conversation.name.toLowerCase().includes(q) ||
        conversation.role.toLowerCase().includes(q) ||
        conversation.preview.toLowerCase().includes(q),
    )
  }, [conversations, q])

  function handleSelectConversation(conversation: DirectConversation) {
    setOpen(false)
    setQuery("")
    router.push(
      `/messages?conversation=${conversation.id}&shareMember=${person.id}`,
    )
  }

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (!next) setQuery("")
      }}
    >
      <PopoverTrigger render={children} />
      <PopoverContent
        align="end"
        side="top"
        className="flex w-80 flex-col gap-0 overflow-hidden p-0"
      >
        <div className="shrink-0 border-b p-3">
          <p className="mb-2 text-sm font-medium">Share member</p>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search messages…"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-72 min-h-0 overflow-y-auto overscroll-y-contain">
          {inboxLoading && conversations.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              Loading conversations…
            </p>
          ) : filteredConversations.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              {q
                ? "No conversations match your search."
                : "Start a conversation to share this member."}
            </p>
          ) : (
            <div className="py-1">
              <div className="flex items-center justify-between px-3 py-2">
                <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Messages
                </span>
                <span className="text-xs text-muted-foreground/80">
                  {filteredConversations.length}
                </span>
              </div>
              <ul>
                {filteredConversations.map((conversation) => (
                  <li key={conversation.id}>
                    <button
                      type="button"
                      className={cn(
                        "flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/60",
                      )}
                      onClick={() => handleSelectConversation(conversation)}
                    >
                      <Avatar className="size-9 shrink-0">
                        <AvatarImage
                          src={conversation.avatar || undefined}
                          alt=""
                        />
                        <AvatarFallback>
                          {initials(conversation.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {conversation.name}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {conversation.role}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t px-3 py-2">
          <p className="truncate text-xs text-muted-foreground">
            Sharing {personToSharePayload(person).name}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  )
}
