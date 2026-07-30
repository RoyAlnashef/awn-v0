"use client"

import { useEffect, useState } from "react"
import { Search } from "lucide-react"

import {
  FLYOUT_DRAWER_CONTENT_CLASS,
  FlyoutDrawerClose,
} from "@/components/messages/flyout-drawer"
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
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
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
      <DrawerHeader className="shrink-0 gap-3 border-b p-4 pr-14">
        <div className="flex flex-col gap-1">
          <DrawerTitle>
            {shareContext ? "Share with…" : "New message"}
          </DrawerTitle>
          <DrawerDescription>
            {shareContext
              ? `Choose who to send ${shareContext.label} to.`
              : "Search for someone on AWN to start a conversation."}
          </DrawerDescription>
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
      </DrawerHeader>

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
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
      {open ? (
        <DrawerContent className={FLYOUT_DRAWER_CONTENT_CLASS}>
          <FlyoutDrawerClose />
          <NewMessageDrawerPanel
            open={open}
            onSelectMember={handleSelect}
            shareContext={shareContext}
          />
        </DrawerContent>
      ) : null}
    </Drawer>
  )
}
