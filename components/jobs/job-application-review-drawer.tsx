"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { ExternalLink } from "lucide-react"

import {
  FLYOUT_DRAWER_CONTENT_CLASS,
  FlyoutDrawerClose,
} from "@/components/messages/flyout-drawer"
import type { JobApplication, ReviewApplicationStatus } from "@/lib/jobs/fetch"
import { applicationStatusConfig } from "@/lib/jobs/format"
import { getJobApplicationResumeSignedUrl } from "@/lib/jobs/resume-actions"
import { getSocialLinksFromFields } from "@/lib/social-links"
import { initials } from "@/lib/users-data"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type FooterMode = "actions" | "compose" | "accepted"

export function JobApplicationReviewDrawer({
  application,
  open,
  onOpenChange,
  onStatusChange,
  onAcceptWithMessage,
  updating,
  conversationId,
}: {
  application: JobApplication | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusChange: (status: ReviewApplicationStatus) => void
  onAcceptWithMessage: (message: string) => void
  updating: boolean
  conversationId?: string | null
}) {
  const [resumeUrl, setResumeUrl] = useState<string | null>(null)
  const [footerMode, setFooterMode] = useState<FooterMode>("actions")
  const [message, setMessage] = useState("")
  const [messageError, setMessageError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !application?.resumeUrl) {
      setResumeUrl(null)
      return
    }

    void getJobApplicationResumeSignedUrl(application.id).then((result) => {
      setResumeUrl(result.ok ? result.url : null)
    })
  }, [application, open])

  useEffect(() => {
    if (!open) {
      setFooterMode("actions")
      setMessage("")
      setMessageError(null)
      return
    }

    if (application?.status === "approved") {
      setFooterMode("accepted")
      return
    }

    setFooterMode("actions")
    setMessage("")
    setMessageError(null)
  }, [open, application?.status, application?.id])

  if (!application) return null

  const status = applicationStatusConfig[application.status]
  const resumeLabel =
    application.applicant.resumeFileName?.trim() || "resume.pdf"
  const socialLinks = getSocialLinksFromFields(application.applicant.socialLinks)

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
      setMessageError("Write a message to start the conversation.")
      return
    }
    setMessageError(null)
    onAcceptWithMessage(trimmed)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
      <DrawerContent className={FLYOUT_DRAWER_CONTENT_CLASS}>
        <FlyoutDrawerClose />
        <DrawerTitle className="sr-only">
          Review application from {application.applicant.name}
        </DrawerTitle>
        <DrawerDescription className="sr-only">
          Application details, social links, resume, and review actions.
        </DrawerDescription>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="border-b px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <Avatar className="size-10 shrink-0">
                  <AvatarImage src={application.applicant.avatar} alt="" />
                  <AvatarFallback>
                    {initials(application.applicant.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h2 className="font-heading text-lg font-semibold">
                    {application.applicant.name}
                  </h2>
                  {application.applicant.email ? (
                    <p className="text-sm text-muted-foreground">
                      {application.applicant.email}
                    </p>
                  ) : null}
                  <p className="mt-1 text-sm">{application.applicant.title}</p>
                </div>
              </div>
              <Badge variant="outline" className={cn("border", status.className)}>
                {status.label}
              </Badge>
            </div>
          </div>

          <div className="space-y-6 px-4 py-4">
            <section className="space-y-2">
              <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Application note
              </h3>
              <p className="text-sm text-muted-foreground">
                {application.note.trim() || "No note provided."}
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Applied
              </h3>
              <p className="text-sm text-muted-foreground">
                {format(new Date(application.createdAt), "MMM d, yyyy")}
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Social links
              </h3>
              {socialLinks.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No social links provided.
                </p>
              ) : (
                <TooltipProvider delay={400}>
                  <div className="flex flex-wrap gap-1.5">
                    {socialLinks.map((link) => {
                      const LinkIcon = link.icon
                      const button = (
                        <Button
                          variant="outline"
                          size="icon-sm"
                          aria-label={`${link.label}: ${link.display}`}
                          nativeButton={false}
                          render={
                            <a
                              href={link.href}
                              target="_blank"
                              rel="noreferrer"
                            />
                          }
                        >
                          <LinkIcon />
                        </Button>
                      )

                      return (
                        <Tooltip key={link.id}>
                          <TooltipTrigger
                            render={<span className="inline-flex">{button}</span>}
                          />
                          <TooltipContent>{link.display}</TooltipContent>
                        </Tooltip>
                      )
                    })}
                  </div>
                </TooltipProvider>
              )}
            </section>

            <section className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                  Resume
                </h3>
                {resumeUrl ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    nativeButton={false}
                    render={
                      <a href={resumeUrl} target="_blank" rel="noreferrer" />
                    }
                  >
                    View
                    <ExternalLink />
                  </Button>
                ) : null}
              </div>
              {resumeUrl ? (
                <iframe
                  title={`Resume for ${application.applicant.name}`}
                  src={resumeUrl}
                  className="h-[min(50vh,480px)] w-full rounded-xl border bg-muted/20"
                />
              ) : (
                <p className="text-sm text-muted-foreground">
                  {application.resumeUrl
                    ? "Loading resume…"
                    : "No resume uploaded."}
                </p>
              )}
              {application.resumeUrl && resumeUrl ? (
                <p className="text-xs text-muted-foreground">{resumeLabel}</p>
              ) : null}
            </section>
          </div>
          </div>

          {application.status === "pending" && footerMode === "actions" ? (
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
                disabled={updating}
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
          ) : null}

          {application.status === "pending" && footerMode === "compose" ? (
            <div className="flex shrink-0 flex-col gap-3 border-t bg-popover p-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-300 ease-out">
              <div className="space-y-2">
                <Label htmlFor="accept-message">
                  Start the conversation with {application.applicant.name}
                </Label>
                <Textarea
                  id="accept-message"
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
          ) : null}

          {application.status === "approved" && footerMode === "accepted" ? (
            <div className="flex shrink-0 flex-col gap-3 border-t bg-popover p-4">
              <p className="text-sm text-muted-foreground">
                Application accepted. Conversation started with{" "}
                {application.applicant.name}.
              </p>
              {conversationId ? (
                <Button
                  className="w-full"
                  nativeButton={false}
                  render={
                    <Link
                      href={`/messages?conversation=${encodeURIComponent(conversationId)}`}
                    />
                  }
                >
                  View conversation
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
