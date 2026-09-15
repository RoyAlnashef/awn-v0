"use client"

import { useMemo } from "react"

import type { MentionMember } from "@/lib/messages/mentions"
import { filterMentionMembers } from "@/lib/messages/mentions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Popover, PopoverContent } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

function memberInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
}

function highlightMatch(name: string, query: string) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return name

  const lowerName = name.toLowerCase()
  const index = lowerName.indexOf(normalized)
  if (index === -1) return name

  const before = name.slice(0, index)
  const match = name.slice(index, index + normalized.length)
  const after = name.slice(index + normalized.length)

  return (
    <>
      {before}
      <span className="font-semibold text-foreground">{match}</span>
      {after}
    </>
  )
}

function MentionPickerList({
  members,
  query,
  onSelect,
}: {
  members: MentionMember[]
  query: string
  onSelect: (member: MentionMember) => void
}) {
  if (members.length === 0) {
    return (
      <p className="px-4 py-6 text-center text-sm text-muted-foreground">
        No members match
      </p>
    )
  }

  return (
    <ul className="flex flex-col">
      {members.map((member) => (
        <li key={member.id}>
          <button
            type="button"
            tabIndex={-1}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-accent/60 focus-visible:outline-none"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => onSelect(member)}
          >
            <Avatar className="size-9 shrink-0">
              <AvatarImage src={member.avatarUrl ?? undefined} alt="" />
              <AvatarFallback>{memberInitials(member.name)}</AvatarFallback>
            </Avatar>
            <span className="min-w-0 truncate text-sm text-foreground">
              {highlightMatch(member.name, query)}
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}

export function MentionPicker({
  open,
  onOpenChange,
  members,
  query,
  currentUserId,
  anchor,
  onSelect,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  members: MentionMember[]
  query: string
  currentUserId?: string
  anchor?: HTMLElement | null
  onSelect: (member: MentionMember) => void
}) {
  const filteredMembers = useMemo(
    () => filterMentionMembers(members, query, currentUserId),
    [members, query, currentUserId],
  )

  function handleSelect(member: MentionMember) {
    onSelect(member)
    onOpenChange(false)
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      {open ? (
        <PopoverContent
          side="top"
          align="start"
          sideOffset={8}
          anchor={anchor ?? undefined}
          initialFocus={false}
          finalFocus={false}
          className={cn(
            "w-[min(100vw-2rem,20rem)] gap-0 overflow-hidden p-0",
          )}
        >
          <div className="border-b px-3 py-2">
            <p className="text-xs font-medium text-muted-foreground">
              Mention a member
            </p>
          </div>
          <div className="max-h-56 overflow-y-auto">
            <MentionPickerList
              members={filteredMembers}
              query={query}
              onSelect={handleSelect}
            />
          </div>
        </PopoverContent>
      ) : null}
    </Popover>
  )
}
