"use client"

import { useCallback, useEffect, useMemo, useState, useTransition } from "react"
import { formatDistanceToNow } from "date-fns"
import { Loader2, Send, TestTube2 } from "lucide-react"
import { toast } from "sonner"

import { useEmailPreview } from "@/components/email/email-preview-provider"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { wrapBroadcastBodyHtml } from "@/lib/email/catalog"
import { applyPreviewTheme } from "@/lib/email/preview-theme"
import {
  getBroadcastRecipientCount,
  listBroadcastHistory,
  sendBroadcast,
  sendBroadcastTest,
  type BroadcastFilters,
  type BroadcastHistoryItem,
} from "@/lib/email/broadcast-actions"
import type { DbUserRole, DbUserStatus } from "@/lib/users-data"
import { cn } from "@/lib/utils"

const ROLE_OPTIONS: { value: DbUserRole; label: string }[] = [
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
  { value: "manager", label: "Manager" },
  { value: "member", label: "Member" },
]

const STATUS_OPTIONS: { value: DbUserStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "invited", label: "Invited" },
  { value: "pending", label: "Pending" },
  { value: "denied", label: "Denied" },
  { value: "suspended", label: "Suspended" },
]

const DEFAULT_FILTERS: BroadcastFilters = {
  roles: [],
  statuses: ["active"],
}

function toggleValue<T extends string>(values: T[], value: T): T[] {
  return values.includes(value)
    ? values.filter((v) => v !== value)
    : [...values, value]
}

export function BroadcastPageContent({
  initialHistory,
  historyError,
}: {
  initialHistory: BroadcastHistoryItem[]
  historyError: string | null
}) {
  const { setHtml, setEmptyMessage, setClipboardCopy, previewTheme } =
    useEmailPreview()
  const [subject, setSubject] = useState("")
  const [bodyText, setBodyText] = useState("")
  const [filters, setFilters] = useState<BroadcastFilters>(DEFAULT_FILTERS)
  const [recipientCount, setRecipientCount] = useState<number | null>(null)
  const [history, setHistory] = useState(initialHistory)
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(
    null,
  )
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmKind, setConfirmKind] = useState<"test" | "broadcast">("test")
  const [pending, startTransition] = useTransition()

  const previewHtml = useMemo(() => {
    const trimmedSubject = subject.trim()
    if (!trimmedSubject && !bodyText.trim()) return null
    return wrapBroadcastBodyHtml({
      subject: trimmedSubject || "Broadcast subject",
      bodyText: bodyText || "Your message will appear here.",
      theme: previewTheme,
    })
  }, [subject, bodyText, previewTheme])

  useEffect(() => {
    setEmptyMessage("Compose a message to preview.")
    setClipboardCopy(null)
  }, [setEmptyMessage, setClipboardCopy])

  useEffect(() => {
    if (selectedHistoryId) {
      const item = history.find((h) => h.id === selectedHistoryId)
      if (item) {
        setHtml(
          previewTheme === "light"
            ? applyPreviewTheme(item.htmlBody, "light")
            : item.htmlBody,
        )
        return
      }
    }
    setHtml(previewHtml)
  }, [selectedHistoryId, history, previewHtml, previewTheme, setHtml])

  const refreshRecipientCount = useCallback(() => {
    startTransition(async () => {
      const result = await getBroadcastRecipientCount(filters)
      if (result.ok) {
        setRecipientCount(result.data.count)
      } else {
        setRecipientCount(null)
      }
    })
  }, [filters])

  useEffect(() => {
    refreshRecipientCount()
  }, [refreshRecipientCount])

  function openConfirm(kind: "test" | "broadcast") {
    if (!subject.trim() || !bodyText.trim()) {
      toast.error("Subject and message body are required.")
      return
    }
    setConfirmKind(kind)
    setConfirmOpen(true)
  }

  function handleConfirmSend() {
    startTransition(async () => {
      if (confirmKind === "test") {
        const result = await sendBroadcastTest({ subject, bodyText, filters })
        if (result.ok) {
          toast.success("Test email sent to your inbox.")
        } else {
          toast.error(result.error)
        }
      } else {
        const result = await sendBroadcast({ subject, bodyText, filters })
        if (result.ok) {
          toast.success(`Broadcast sent to ${result.data.recipientCount} members.`)
          setSubject("")
          setBodyText("")
          setSelectedHistoryId(null)
          const historyResult = await listBroadcastHistory()
          if (historyResult.ok) {
            setHistory(historyResult.data.history)
          }
        } else {
          toast.error(result.error)
        }
      }
      setConfirmOpen(false)
    })
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-lg font-semibold">Compose broadcast</h2>
          <p className="text-sm text-muted-foreground">
            Send a one-time email to members matching your audience filters.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="broadcast-subject">Subject</Label>
            <Input
              id="broadcast-subject"
              value={subject}
              onChange={(e) => {
                setSelectedHistoryId(null)
                setSubject(e.target.value)
              }}
              placeholder="AWN update for members"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="broadcast-body">Message</Label>
            <Textarea
              id="broadcast-body"
              value={bodyText}
              onChange={(e) => {
                setSelectedHistoryId(null)
                setBodyText(e.target.value)
              }}
              placeholder="Write your message. Separate paragraphs with a blank line."
              rows={8}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <fieldset className="flex flex-col gap-2">
              <legend className="text-sm font-medium">Roles</legend>
              <p className="text-xs text-muted-foreground">
                Leave all unchecked to include every role.
              </p>
              <div className="flex flex-col gap-2">
                {ROLE_OPTIONS.map(({ value, label }) => (
                  <label
                    key={value}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={filters.roles.includes(value)}
                      onCheckedChange={() =>
                        setFilters((prev) => ({
                          ...prev,
                          roles: toggleValue(prev.roles, value),
                        }))
                      }
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="flex flex-col gap-2">
              <legend className="text-sm font-medium">Status</legend>
              <p className="text-xs text-muted-foreground">
                Defaults to Active only when none selected.
              </p>
              <div className="flex flex-col gap-2">
                {STATUS_OPTIONS.map(({ value, label }) => (
                  <label
                    key={value}
                    className="flex items-center gap-2 text-sm"
                  >
                    <Checkbox
                      checked={filters.statuses.includes(value)}
                      onCheckedChange={() =>
                        setFilters((prev) => ({
                          ...prev,
                          statuses: toggleValue(prev.statuses, value),
                        }))
                      }
                    />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary">
              {pending && recipientCount === null ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                `${recipientCount ?? "—"} recipients`
              )}
            </Badge>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={pending}
                onClick={() => openConfirm("test")}
              >
                <TestTube2 />
                Send test to me
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={pending || recipientCount === 0}
                onClick={() => openConfirm("broadcast")}
              >
                <Send />
                Send broadcast
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3 border-t border-border pt-6">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading text-lg font-semibold">Send history</h2>
          {historyError ? (
            <p className="text-sm text-destructive">{historyError}</p>
          ) : null}
        </div>

        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No broadcasts sent yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {history.map((item) => {
              const selected = selectedHistoryId === item.id
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedHistoryId(item.id)}
                    className={cn(
                      "flex w-full flex-col gap-1 rounded-lg border px-3 py-3 text-left transition-colors",
                      selected
                        ? "border-primary/40 bg-primary/5"
                        : "border-border hover:bg-muted/40",
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium text-sm">{item.subject}</span>
                      <Badge variant="outline">
                        {item.recipientCount} sent
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(item.sentAt), {
                        addSuffix: true,
                      })}{" "}
                      · {item.sentByName}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmKind === "test" ? "Send test email?" : "Send broadcast?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmKind === "test"
                ? "A test copy will be sent to your admin email address."
                : `This will email ${recipientCount ?? 0} members. This action cannot be undone.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction disabled={pending} onClick={handleConfirmSend}>
              {pending ? <Loader2 className="size-4 animate-spin" /> : null}
              {confirmKind === "test" ? "Send test" : "Send broadcast"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
