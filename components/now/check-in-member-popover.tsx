"use client"

import type { ReactElement } from "react"

import { PersonCard } from "@/components/people/person-card"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { CheckedInMember } from "@/lib/now/check-in"

export function CheckInMemberPopover({
  member,
  open,
  onOpenChange,
  onRequestProfile,
  trigger,
  side = "top",
}: {
  member: CheckedInMember
  open: boolean
  onOpenChange: (open: boolean) => void
  onRequestProfile?: (member: CheckedInMember) => void
  trigger: ReactElement
  side?: "top" | "bottom" | "left" | "right"
}) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger render={trigger} />
      <PopoverContent
        className="w-56 border-border p-0 shadow-lg"
        align="center"
        side={side}
        sideOffset={8}
      >
        <PersonCard
          person={member.person}
          checkInNote={member.note}
          className="border-0 shadow-none hover:border-0"
          onRequestProfile={() => {
            onRequestProfile?.(member)
            window.requestAnimationFrame(() => onOpenChange(false))
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
