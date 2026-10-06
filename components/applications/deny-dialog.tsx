"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"

import {
  bulkDenyApplications,
  denyApplication,
  type BulkApplicationReviewResult,
} from "@/lib/applications/actions"
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

const NOTE_VISIBILITY_OPTIONS: {
  value: ApplicationNoteVisibility
  label: string
}[] = [
  { value: "invitee_only", label: "Notify invitee only" },
  { value: "both", label: "Notify invitee and inviter" },
]

function formatBulkDenyMessage(result: BulkApplicationReviewResult): string {
  const parts: string[] = []

  if (result.succeeded > 0) {
    parts.push(
      `Denied ${result.succeeded} application${result.succeeded === 1 ? "" : "s"}`,
    )
  }

  if (result.skipped > 0) {
    parts.push(`${result.skipped} skipped (not pending)`)
  }

  if (result.failed > 0) {
    parts.push(`${result.failed} failed`)
  }

  return parts.join(", ")
}

function toastBulkDenyResult(result: BulkApplicationReviewResult) {
  if (result.succeeded > 0) {
    toast.success(formatBulkDenyMessage(result))
    return
  }

  if (result.skipped > 0 && result.failed === 0) {
    toast.info(formatBulkDenyMessage(result))
    return
  }

  toast.error(formatBulkDenyMessage(result))
}

export function DenyDialog({
  applications,
  open,
  onOpenChange,
  onDenied,
}: {
  applications: MembershipApplication[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onDenied: () => void
}) {
  const [note, setNote] = useState("")
  const [visibility, setVisibility] =
    useState<ApplicationNoteVisibility>("invitee_only")
  const [isPending, startTransition] = useTransition()

  const count = applications.length
  const single = count === 1 ? applications[0]! : null
  const hasInviteSource = applications.some((app) => app.source === "invite")

  function reset() {
    setNote("")
    setVisibility("invitee_only")
  }

  function handleDeny() {
    if (count === 0) return

    const trimmedNote = note.trim()
    const noteVisibility =
      trimmedNote && hasInviteSource ? visibility : undefined

    startTransition(async () => {
      if (count === 1) {
        const application = applications[0]!
        const perAppVisibility =
          trimmedNote && application.source === "invite"
            ? visibility
            : undefined

        const result = await denyApplication({
          applicationId: application.id,
          note: trimmedNote || undefined,
          noteVisibility: perAppVisibility,
        })

        if (!result.ok) {
          toast.error(result.error)
          return
        }

        toast.success(`${application.fullName} denied`)
      } else {
        const result = await bulkDenyApplications({
          applicationIds: applications.map((app) => app.id),
          note: trimmedNote || undefined,
          noteVisibility,
        })

        if (!result.ok) {
          toast.error(result.error)
          return
        }

        toastBulkDenyResult(result.result)
      }

      reset()
      onOpenChange(false)
      onDenied()
    })
  }

  const notePlaceholder = hasInviteSource
    ? "Share context for the applicant or inviter…"
    : "Share context for the applicant…"

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
          <DialogTitle>
            {count === 1 ? "Deny application" : `Deny ${count} applications`}
          </DialogTitle>
          <DialogDescription>
            {count === 1 && single
              ? `Deny ${single.fullName}'s membership application.`
              : `Deny ${count} membership applications. The same note applies to each selected application.`}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="deny-note">Note (optional)</Label>
            <Textarea
              id="deny-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={notePlaceholder}
              rows={4}
            />
          </div>

          {hasInviteSource ? (
            <div className="grid gap-2">
              <Label>Note visibility</Label>
              <Select
                value={visibility}
                onValueChange={(value) =>
                  setVisibility(value as ApplicationNoteVisibility)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value) =>
                      NOTE_VISIBILITY_OPTIONS.find(
                        (option) => option.value === value,
                      )?.label ?? value
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {NOTE_VISIBILITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
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
            {isPending
              ? "Denying…"
              : count === 1
                ? "Deny application"
                : `Deny ${count} applications`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
