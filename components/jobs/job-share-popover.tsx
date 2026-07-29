"use client"

import { useMemo, useState, type ReactElement, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

import { useMessages } from "@/components/messages/messages-provider"
import { useRooms } from "@/components/rooms/rooms-provider"
import { jobToSharePayload } from "@/lib/messages/job-share"
import type { DirectConversation } from "@/lib/messages-data"
import type { Job } from "@/lib/jobs-data"
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

function DestinationSection({
  title,
  count,
  children,
}: {
  title: string
  count: number
  children: ReactNode
}) {
  if (count === 0) return null

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-3 py-2">
        <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          {title}
        </span>
        <span className="text-xs text-muted-foreground/80">{count}</span>
      </div>
      {children}
    </div>
  )
}

export function JobSharePopover({
  job,
  children,
}: {
  job: Job
  children: ReactElement
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const { conversations } = useMessages()
  const { sortedRooms } = useRooms()
  const { isLoading: inboxLoading } = useInbox({ enabled: open })

  const q = query.trim().toLowerCase()

  const joinedRooms = useMemo(
    () => sortedRooms.filter((room) => room.joined),
    [sortedRooms],
  )

  const filteredRooms = useMemo(() => {
    if (!q) return joinedRooms
    return joinedRooms.filter(
      (room) =>
        room.name.toLowerCase().includes(q) ||
        room.description.toLowerCase().includes(q),
    )
  }, [joinedRooms, q])

  const filteredConversations = useMemo(() => {
    if (!q) return conversations
    return conversations.filter(
      (conversation) =>
        conversation.name.toLowerCase().includes(q) ||
        conversation.role.toLowerCase().includes(q) ||
        conversation.preview.toLowerCase().includes(q),
    )
  }, [conversations, q])

  function handleSelectRoom(roomId: string) {
    setOpen(false)
    setQuery("")
    router.push(`/rooms?room=${roomId}&shareJob=${job.id}`)
  }

  function handleSelectConversation(conversation: DirectConversation) {
    setOpen(false)
    setQuery("")
    router.push(
      `/messages?conversation=${conversation.id}&shareJob=${job.id}`,
    )
  }

  const hasResults =
    filteredRooms.length > 0 || filteredConversations.length > 0

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
          <p className="mb-2 text-sm font-medium">Share job</p>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search communities and messages…"
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
              Loading destinations…
            </p>
          ) : !hasResults ? (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">
              {q
                ? "No communities or conversations match your search."
                : "Join a community or start a conversation to share this job."}
            </p>
          ) : (
            <div className="py-1">
              <DestinationSection title="Communities" count={filteredRooms.length}>
                <ul>
                  {filteredRooms.map((room) => (
                    <li key={room.id}>
                      <button
                        type="button"
                        className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-muted/60"
                        onClick={() => handleSelectRoom(room.id)}
                      >
                        <span
                          className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-base"
                          aria-hidden
                        >
                          {room.icon}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">
                            {room.name}
                          </span>
                          <span className="block truncate text-xs text-muted-foreground">
                            {room.description}
                          </span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </DestinationSection>

              <DestinationSection title="Messages" count={filteredConversations.length}>
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
              </DestinationSection>
            </div>
          )}
        </div>

        <div className="shrink-0 border-t px-3 py-2">
          <p className="truncate text-xs text-muted-foreground">
            Sharing {jobToSharePayload(job).role}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  )
}
