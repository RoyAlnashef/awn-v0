"use client"

import { useEffect, useId, useState } from "react"

import type { JobApplication, ReviewApplicationStatus } from "@/lib/jobs/fetch"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

type FooterMode = "actions" | "compose"

export function JobApplicationReviewFooter({
  application,
  updating,
  onStatusChange,
  onAcceptWithMessage,
}: {
  application: JobApplication
  updating: boolean
  onStatusChange: (status: ReviewApplicationStatus) => void
  onAcceptWithMessage: (message: string) => void
}) {
  const messageFieldId = useId()
  const [footerMode, setFooterMode] = useState<FooterMode>("actions")
  const [message, setMessage] = useState("")
  const [messageError, setMessageError] = useState<string | null>(null)

  useEffect(() => {
    setFooterMode("actions")
    setMessage("")
    setMessageError(null)
  }, [application.id, application.status])

  const showReviewFooter =
    application.status === "pending" || application.status === "maybe"

  function handleAcceptClick() {
    setMessageError(null)
    setFooterMode("compose")
  }

  function handleCancelCompose() {
    setMessage("")
    setMessageError(null)
    setFooterMode("actions")
  }

  function handleStartConversation() {
    const trimmed = message.trim()
    if (!trimmed) {
      setMessageError("Sending a message confirms your interest in this member.")
      return
    }
    setMessageError(null)
    onAcceptWithMessage(trimmed)
  }

  if (!showReviewFooter) return null

  if (footerMode === "compose") {
    return (
      <div className="flex shrink-0 flex-col gap-3 border-t bg-popover p-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-300 ease-out">
        <div className="flex flex-col gap-1 space-y-2">
          <Label htmlFor={messageFieldId}>
            Start the conversation with {application.applicant.name}
          </Label>
          <Textarea
            id={messageFieldId}
            value={message}
            onChange={(event) => {
              setMessage(event.target.value)
              if (messageError) setMessageError(null)
            }}
            placeholder="Let them know you're interested and what the next steps are…"
            rows={3}
            disabled={updating}
            aria-invalid={messageError ? true : undefined}
          />
          {messageError ? (
            <p className="text-sm text-destructive">{messageError}</p>
          ) : null}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            disabled={updating}
            onClick={handleCancelCompose}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            disabled={updating}
            onClick={handleStartConversation}
          >
            Send message
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex shrink-0 gap-2 border-t bg-popover p-4">
      <Button
        className="flex-1"
        disabled={updating}
        onClick={handleAcceptClick}
      >
        Accept
      </Button>
      <Button
        variant="outline"
        className="flex-1"
        disabled={updating || application.status === "maybe"}
        onClick={() => onStatusChange("maybe")}
      >
        Maybe
      </Button>
      <Button
        variant="outline"
        className="flex-1"
        disabled={updating}
        onClick={() => onStatusChange("declined")}
      >
        Decline
      </Button>
    </div>
  )
}
