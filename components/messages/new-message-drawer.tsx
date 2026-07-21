"use client"

import { useEffect, useState } from "react"
import { Search } from "lucide-react"

import { searchMessageableUsers } from "@/lib/messages/actions"
import { type MessageableMember } from "@/lib/messages-data"
import { initials } from "@/lib/people-data"
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

function memberSubtitle(member: MessageableMember) {
  if (member.homeBase) {
    return `${member.role} · ${member.homeBase}`
  }
  return member.role
}

export function NewMessageDrawer({
  open,
  onOpenChange,
  onSelectMember,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectMember: (member: MessageableMember) => void
}) {
  const [query, setQuery] = useState("")
  const [members, setMembers] = useState<MessageableMember[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return

    let cancelled = false
    const timeout = window.setTimeout(() => {
      setLoading(true)
      setError(null)

      void searchMessageableUsers(query).then((result) => {
        if (cancelled) return

        if (result.ok) {
          setMembers(result.users)
          setError(null)
        } else {
          setMembers([])
          setError(result.error)
        }
        setLoading(false)
      })
    }, query ? 250 : 0)

    return () => {
      cancelled = true
      window.clearTimeout(timeout)
    }
  }, [open, query])

  function handleSelect(member: MessageableMember) {
    onSelectMember(member)
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
          {loading ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              Loading members…
            </p>
          ) : error ? (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              {error}
            </p>
          ) : members.length > 0 ? (
            <ul className="flex flex-col">
              {members.map((member) => (
                <li key={member.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(member)}
                    className="flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-accent/60"
                  >
                    <div className="relative shrink-0">
                      <Avatar className="size-10">
                        <AvatarImage src={member.avatar || undefined} alt="" />
                        <AvatarFallback>
                          {initials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      {member.online ? (
                        <span
                          aria-hidden="true"
                          className="absolute right-0 bottom-0 size-2.5 rounded-full bg-primary ring-2 ring-background"
                        />
                      ) : null}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <p className="truncate text-sm font-medium text-foreground">
                        {member.name}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {memberSubtitle(member)}
                      </p>
                    </div>

                    <span
                      className={cn(
                        "flex shrink-0 items-center gap-1.5 text-xs",
                        member.online
                          ? "text-primary"
                          : "text-muted-foreground/80",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "size-1.5 rounded-full",
                          member.online
                            ? "bg-primary"
                            : "bg-muted-foreground/40",
                        )}
                      />
                      {member.online ? "Online" : "Offline"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-10 text-center text-sm text-muted-foreground">
              {query.trim()
                ? `No people match “${query}”.`
                : "No members found on AWN yet."}
            </p>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
