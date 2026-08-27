"use client"

import { useState } from "react"
import { UserPlus } from "lucide-react"

import { InvitePanel } from "@/components/invites/invite-panel"
import { useIsMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"

export function InvitePopoverTrigger() {
  const [open, setOpen] = useState(false)
  const isMobile = useIsMobile()

  const trigger = (
    <Button size="sm">
      <UserPlus />
      Invite
    </Button>
  )

  if (isMobile) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={trigger} />
        <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[420px]">
          <DialogTitle className="sr-only">Invite people</DialogTitle>
          <DialogDescription className="sr-only">
            Send email invites and manage your pending referrals.
          </DialogDescription>
          <InvitePanel open={open} />
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger render={trigger} />
      {open ? (
        <PopoverContent
          side="bottom"
          align="end"
          sideOffset={8}
          className="w-[min(100vw-2rem,420px)] gap-0 p-0"
        >
          <PopoverTitle className="sr-only">Invite people</PopoverTitle>
          <PopoverDescription className="sr-only">
            Send email invites and manage your pending referrals.
          </PopoverDescription>
          <InvitePanel open={open} />
        </PopoverContent>
      ) : null}
    </Popover>
  )
}
