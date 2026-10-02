"use client"

import { useEffect, useState, useTransition } from "react"
import { toast } from "sonner"

import { listBlockedMembers, unblockMember } from "@/lib/moderation/actions"
import type { BlockedMemberSummary } from "@/lib/moderation/data"
import { initials } from "@/lib/users-data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"

export function BlockedMembersDrawer({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [members, setMembers] = useState<BlockedMemberSummary[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!open) return
    void listBlockedMembers().then((result) => {
      if (!result.ok) {
        setLoadError(result.error)
        setMembers([])
        return
      }
      setLoadError(null)
      setMembers(result.members)
    })
  }, [open])

  function handleUnblock(member: BlockedMemberSummary) {
    startTransition(async () => {
      const result = await unblockMember(member.id)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      setMembers((current) => current.filter((entry) => entry.id !== member.id))
      toast.success(`${member.name} has been unblocked.`)
    })
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle>Blocked members</DrawerTitle>
          <DrawerDescription>
            Members you have blocked. Unblock to restore visibility and messaging.
          </DrawerDescription>
        </DrawerHeader>
        <div className="flex flex-col gap-2 overflow-y-auto px-4 pb-6">
          {loadError ? (
            <p className="text-sm text-destructive">{loadError}</p>
          ) : null}
          {members.length === 0 && !loadError ? (
            <p className="text-sm text-muted-foreground">No blocked members.</p>
          ) : null}
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between gap-3 rounded-lg border p-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <Avatar size="sm">
                  {member.avatar ? (
                    <AvatarImage src={member.avatar} alt="" />
                  ) : null}
                  <AvatarFallback>{initials(member.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-medium">{member.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {member.role}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => handleUnblock(member)}
              >
                Unblock
              </Button>
            </div>
          ))}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
