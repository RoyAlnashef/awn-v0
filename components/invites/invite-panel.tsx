"use client"

import { useEffect, useState, useTransition } from "react"
import { toast } from "sonner"
import { MailPlus } from "lucide-react"

import {
  inviteStatusConfig,
  type MemberInvite,
} from "@/lib/invites/data"
import {
  listMyInvites,
  rescindInvite,
  sendInvite,
} from "@/lib/invites/actions"
import { formatRelativeTime } from "@/lib/messages/format"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function InviteRow({
  invite,
  onRescind,
  rescinding,
}: {
  invite: MemberInvite
  onRescind: (id: string) => void
  rescinding: boolean
}) {
  const status = inviteStatusConfig[invite.status]

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 hover:bg-accent/40">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{invite.inviteeEmail}</p>
        <p className="text-xs text-muted-foreground">
          Sent {formatRelativeTime(invite.sentAt)} ago
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Badge variant="outline" className={cn("border", status.className)}>
          {status.label}
        </Badge>
        {invite.status === "pending" && !invite.applicationId ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            disabled={rescinding}
            onClick={() => onRescind(invite.id)}
          >
            Rescind
          </Button>
        ) : null}
      </div>
    </div>
  )
}

export function InvitePanel({ open }: { open: boolean }) {
  const [email, setEmail] = useState("")
  const [invites, setInvites] = useState<MemberInvite[]>([])
  const [unlimitedInvites, setUnlimitedInvites] = useState(false)
  const [slotsRemaining, setSlotsRemaining] = useState<number | null>(5)
  const [maxSlots, setMaxSlots] = useState<number | null>(5)
  const [loading, setLoading] = useState(false)
  const [isPending, startTransition] = useTransition()

  const atInviteLimit =
    !unlimitedInvites && slotsRemaining !== null && slotsRemaining <= 0

  useEffect(() => {
    if (!open) return

    setLoading(true)
    void listMyInvites().then((result) => {
      setLoading(false)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      setInvites(result.invites)
      setUnlimitedInvites(result.unlimitedInvites)
      setSlotsRemaining(result.slotsRemaining)
      setMaxSlots(result.maxSlots)
    })
  }, [open])

  function refreshInvites() {
    void listMyInvites().then((result) => {
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      setInvites(result.invites)
      setUnlimitedInvites(result.unlimitedInvites)
      setSlotsRemaining(result.slotsRemaining)
      setMaxSlots(result.maxSlots)
    })
  }

  function handleSend(event: React.FormEvent) {
    event.preventDefault()
    startTransition(async () => {
      const result = await sendInvite(email)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success(`Invite sent to ${email.trim()}`)
      setEmail("")
      refreshInvites()
    })
  }

  function handleRescind(id: string) {
    startTransition(async () => {
      const result = await rescindInvite(id)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      toast.success("Invite rescinded")
      refreshInvites()
    })
  }

  return (
    <div className="flex flex-col">
      <div className="border-b px-4 py-3">
        <p className="text-sm">
          <span className="font-medium">Invite people</span>
          <span className="text-muted-foreground">
            {" "}
            ·{" "}
            {unlimitedInvites
              ? "Unlimited invites"
              : `${slotsRemaining} of ${maxSlots} remaining`}
          </span>
        </p>
      </div>

      <div className="border-b px-4 py-3">
        <form onSubmit={handleSend} className="flex gap-2">
          <Label htmlFor="invite-email" className="sr-only">
            Email address
          </Label>
          <Input
            id="invite-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="crew@example.com"
            required
            disabled={atInviteLimit || isPending}
            className="min-w-0 flex-1"
          />
          <Button
            type="submit"
            disabled={atInviteLimit || isPending}
            className="shrink-0"
          >
            <MailPlus data-icon="inline-start" />
            {isPending ? "Sending…" : "Send"}
          </Button>
        </form>
      </div>

      <div className="px-4 pt-3 pb-1">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
          Your invites
        </p>
      </div>

      {loading ? (
        <p className="px-4 pb-3 text-sm text-muted-foreground">
          Loading invites…
        </p>
      ) : invites.length === 0 ? (
        <p className="px-4 pb-3 text-sm text-muted-foreground">
          No invites sent yet.
        </p>
      ) : (
        <div className="max-h-72 overflow-y-auto px-2 pb-2">
          {invites.map((invite) => (
            <InviteRow
              key={invite.id}
              invite={invite}
              onRescind={handleRescind}
              rescinding={isPending}
            />
          ))}
        </div>
      )}
    </div>
  )
}
