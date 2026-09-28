"use client"

import * as React from "react"
import { X } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
} from "@/components/ui/popover"
import type { CheckedInMember } from "@/lib/now/check-in"
import { initials } from "@/lib/people-data"

export function CheckInBundlePopover({
  open,
  onOpenChange,
  anchor,
  cityLabel,
  members,
  onMemberClick,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  anchor: React.RefObject<HTMLElement | null>
  cityLabel: string
  members: CheckedInMember[]
  onMemberClick?: (member: CheckedInMember) => void
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverContent
        className="w-[min(20rem,calc(100vw-2rem))] gap-0 p-0"
        side="bottom"
        align="start"
        sideOffset={8}
        anchor={anchor}
      >
        <PopoverHeader className="flex flex-row items-center justify-between gap-2 border-b border-border px-4 py-3">
          <PopoverTitle className="text-sm font-medium">
            {cityLabel} · {members.length} crew
          </PopoverTitle>
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
          >
            <X />
          </Button>
        </PopoverHeader>
        <ul className="max-h-64 overflow-y-auto py-1">
          {members.map((member) => (
            <li key={member.person.id}>
              <button
                type="button"
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-muted/60"
                onClick={() => onMemberClick?.(member)}
              >
                <Avatar size="sm">
                  <AvatarImage src={member.person.avatar || undefined} alt="" />
                  <AvatarFallback className="text-xs font-medium">
                    {initials(member.person.name)}
                  </AvatarFallback>
                </Avatar>
                <span>
                  <span className="font-medium">{member.person.name}</span>
                  {member.person.role ? (
                    <span className="text-muted-foreground">
                      {" "}
                      · {member.person.role}
                    </span>
                  ) : null}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  )
}
