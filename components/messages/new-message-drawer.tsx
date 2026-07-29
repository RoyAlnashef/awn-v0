"use client"

import { useEffect, useState } from "react"
import { Search } from "lucide-react"

import { searchMessageableUsers } from "@/lib/messages/actions"
import { type MessageableMember } from "@/lib/messages-data"
import { initials } from "@/lib/people-data"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { NewMessageDrawerSkeleton } from "@/components/messages/new-message-drawer-skeleton"

function memberSubtitle(member: MessageableMember) {
  if (member.homeBase) {
    return `${member.role} · ${member.homeBase}`
  }
  return member.role
}

export function NewMessageDrawerPanel({
  open,
  onSelectMember,
  shareContext,
}: {
  open: boolean
  onSelectMember: (member: MessageableMember) => void
  shareContext?: { kind: "job" | "member"; label: string }
}) {
  const [query, setQuery] = useState("")
  const [members, setMembers] = useState<MessageableMember[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setQuery("")
      setMembers([])
      setLoading(false)
      setError(null)
      return
    }

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
    setQuery("")
  }

  return (
    <>
      <SheetHeader className="shrink-0 gap-3 border-b p-4 pr-14">
        <div className="flex flex-col gap-1">
          <SheetTitle>
            {shareContext ? "Share with…" : "New message"}
          </SheetTitle>
          <SheetDescription>
            {shareContext
              ? `Choose who to send ${shareContext.label} to.`
              : "Search for someone on AWN to start a conversation."}
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
          <NewMessageDrawerSkeleton />
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
                  <Avatar
                    className="size-10 shrink-0"
                    aria-label={
                      member.online ? `${member.name}, online` : member.name
                    }
                  >
                    <AvatarImage src={member.avatar || undefined} alt="" />
                    <AvatarFallback>{initials(member.name)}</AvatarFallback>
                    <AvatarBadge online={member.online} className="size-2.5" />
                  </Avatar>

                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <p className="truncate text-sm font-medium text-foreground">
                      {member.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {memberSubtitle(member)}
                    </p>
                  </div>
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
    </>
  )
}

export function NewMessageDrawer({
  open,
  onOpenChange,
  onSelectMember,
  shareContext,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectMember: (member: MessageableMember) => void
  shareContext?: { kind: "job" | "member"; label: string }
}) {
  function handleSelect(member: MessageableMember) {
    onSelectMember(member)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {open ? (
        <SheetContent
          side="right"
          className="inset-y-3! right-3! h-auto! w-full gap-0 overflow-hidden rounded-2xl border p-0 sm:max-w-md"
        >
          <NewMessageDrawerPanel
            open={open}
            onSelectMember={handleSelect}
            shareContext={shareContext}
          />
        </SheetContent>
      ) : null}
    </Sheet>
  )
}
