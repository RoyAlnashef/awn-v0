"use client"

import { useMemo, useState } from "react"
import { Search } from "lucide-react"

import { messageablePeople, isPersonOnline } from "@/lib/messages-data"
import { type Person, initials } from "@/lib/people-data"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

export function NewMessageDrawer({
  open,
  onOpenChange,
  onSelectPerson,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectPerson: (person: Person) => void
}) {
  const [query, setQuery] = useState("")
  const q = query.trim().toLowerCase()

  const results = useMemo(() => {
    if (!q) return messageablePeople
    return messageablePeople.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        p.homeBase.toLowerCase().includes(q),
    )
  }, [q])

  // Sort online members to the top so available people are easy to find.
  const sorted = useMemo(
    () =>
      [...results].sort(
        (a, b) => Number(isPersonOnline(b)) - Number(isPersonOnline(a)),
      ),
    [results],
  )

  function handleSelect(person: Person) {
    onSelectPerson(person)
    onOpenChange(false)
    setQuery("")
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) setQuery("")
      }}
    >
      <SheetContent
        side="right"
        className="inset-y-3! right-3! h-auto! w-full gap-0 overflow-hidden rounded-2xl border p-0 sm:max-w-md"
      >
        <SheetHeader className="shrink-0 gap-3 border-b p-4 pr-14">
          <div className="flex flex-col gap-1">
            <SheetTitle>New message</SheetTitle>
            <SheetDescription>
              Search for someone on AWN to start a conversation.
            </SheetDescription>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search people…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>
        </SheetHeader>

        <ScrollArea className="min-h-0 flex-1">
          {sorted.length > 0 ? (
            <ul className="flex flex-col">
              {sorted.map((person) => {
                const online = isPersonOnline(person)
                return (
                  <li key={person.id}>
                    <button
                      type="button"
                      onClick={() => handleSelect(person)}
                      className="flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-accent/60"
                    >
                      <div className="relative shrink-0">
                        <Avatar className="size-10">
                          <AvatarImage src={person.avatar || undefined} alt="" />
                          <AvatarFallback>
                            {initials(person.name)}
                          </AvatarFallback>
                        </Avatar>
                        {online ? (
                          <span
                            aria-hidden="true"
                            className="absolute right-0 bottom-0 size-2.5 rounded-full bg-primary ring-2 ring-background"
                          />
                        ) : null}
                      </div>

                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <p className="truncate text-sm font-medium text-foreground">
                          {person.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {person.role} · {person.homeBase}
                        </p>
                      </div>

                      <span
                        className={cn(
                          "flex shrink-0 items-center gap-1.5 text-xs",
                          online
                            ? "text-primary"
                            : "text-muted-foreground/80",
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            "size-1.5 rounded-full",
                            online ? "bg-primary" : "bg-muted-foreground/40",
                          )}
                        />
                        {online ? "Online" : "Offline"}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              No people match “{query}”.
            </p>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
