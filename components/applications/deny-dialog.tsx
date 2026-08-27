"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import { denyApplication } from "@/lib/applications/actions"
import type {
  ApplicationNoteVisibility,
  MembershipApplication,
} from "@/lib/invites/data"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

export function DenyDialog({
  application,
  open,
  onOpenChange,
  onDenied,
}: {
  application: MembershipApplication | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDenied: () => void
}) {
  const [note, setNote] = useState("")
  const [visibility, setVisibility] =
    useState<ApplicationNoteVisibility>("invitee_only")
  const [isPending, startTransition] = useTransition()

  function reset() {
    setNote("")
    setVisibility("invitee_only")
  }

  function handleDeny() {
    if (!application) return

    startTransition(async () => {
      const result = await denyApplication({
        applicationId: application.id,
        note: note.trim() || undefined,
        noteVisibility: note.trim() ? visibility : undefined,
      })

      if (!result.ok) {
        toast.error(result.error)
        return
      }

      toast.success(`${application.fullName} denied`)
      reset()
      onOpenChange(false)
      onDenied()
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) reset()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deny application</DialogTitle>
          <DialogDescription>
            {application
              ? `Deny ${application.fullName}'s membership application.`
              : "Deny this application."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="deny-note">Note (optional)</Label>
            <Textarea
              id="deny-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Share context for the applicant or inviter…"
              rows={4}
            />
          </div>

          {note.trim() ? (
            <div className="grid gap-2">
              <Label>Note visibility</Label>
              <Select
                value={visibility}
                onValueChange={(value) =>
                  setVisibility(value as ApplicationNoteVisibility)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="invitee_only">
                    Notify invitee only
                  </SelectItem>
                  <SelectItem value="both">
                    Notify invitee and inviter
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button variant="destructive" disabled={isPending} onClick={handleDeny}>
            {isPending ? "Denying…" : "Deny application"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
