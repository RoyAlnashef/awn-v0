"use client"

import { useMemo, useState } from "react"
import { Check, Search } from "lucide-react"

import {
  directConversations,
  rooms as initialRooms,
  type DirectConversation,
} from "@/lib/messages-data"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

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
  className,
}: {
  activeId?: string
  conversations?: DirectConversation[]
  onSelectConversation?: (conversation: DirectConversation) => void
  className?: string
}) {
  const [query, setQuery] = useState("")
  const [rooms, setRooms] = useState(initialRooms)

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

  const filteredRooms = useMemo(() => {
    if (!q) return rooms
    return rooms.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q),
    )
  }, [q, rooms])

  function toggleJoin(id: string) {
    setRooms((prev) =>
      prev.map((r) => (r.id === id ? { ...r, joined: !r.joined } : r)),
    )
  }

  return (
    <Tabs
      defaultValue="direct"
      className={cn("flex min-h-0 flex-1 flex-col gap-0", className)}
    >
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
        <TabsList className="w-full">
          <TabsTrigger value="direct" className="flex-1 rounded-4xl">
            Direct
          </TabsTrigger>
          <TabsTrigger value="rooms" className="flex-1 rounded-4xl">
            Rooms
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Direct messages */}
      <TabsContent value="direct" className="min-h-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          {filteredConversations.length > 0 ? (
            <ul className="flex flex-col">
              {filteredConversations.map((c) => {
                const active = activeId === c.id
                return (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => onSelectConversation?.(c)}
                      aria-current={active ? "true" : undefined}
                      className={cn(
                        "relative flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-accent/60",
                        c.unread && "bg-primary/[0.06]",
                        active && "bg-accent",
                      )}
                    >
                      {c.unread ? (
                        <span
                          aria-hidden="true"
                          className="absolute inset-y-0 left-0 w-0.5 bg-primary"
                        />
                      ) : null}

                      <div className="relative shrink-0">
                        <Avatar className="size-10">
                          <AvatarImage src={c.avatar || undefined} alt="" />
                          <AvatarFallback>{initials(c.name)}</AvatarFallback>
                        </Avatar>
                        {c.online ? (
                          <span
                            aria-hidden="true"
                            className="absolute right-0 bottom-0 size-2.5 rounded-full bg-primary ring-2 ring-background"
                          />
                        ) : null}
                      </div>

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
      </TabsContent>

      {/* Rooms */}
      <TabsContent value="rooms" className="min-h-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="flex items-center justify-between px-4 pt-3 pb-1.5">
            <span className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Rooms
            </span>
            <span className="text-xs text-muted-foreground/80">
              {filteredRooms.length}
            </span>
          </div>
          {filteredRooms.length > 0 ? (
            <ul className="flex flex-col">
              {filteredRooms.map((room) => {
                const Icon = room.icon
                return (
                  <li key={room.id}>
                    <div className="flex items-center gap-3 border-b px-4 py-3 last:border-b-0">
                      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground/80">
                        <Icon className="size-5" />
                      </span>
                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <p className="truncate text-sm font-medium text-foreground">
                          {room.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {room.description}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant={room.joined ? "outline" : "default"}
                        className="shrink-0"
                        aria-pressed={room.joined}
                        onClick={() => toggleJoin(room.id)}
                      >
                        {room.joined ? (
                          <>
                            <Check className="size-3.5" />
                            Joined
                          </>
                        ) : (
                          "Join"
                        )}
                      </Button>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              No rooms match “{query}”.
            </p>
          )}
        </ScrollArea>
      </TabsContent>
    </Tabs>
  )
}
