"use client"

import { useEffect, useState } from "react"
import { ExternalLink } from "lucide-react"

import { ApplicationTitlesBadges } from "@/components/applications/application-titles-badges"
import { SOCIAL_FIELD_ICONS } from "@/components/icons/social-brand-icons"
import {
  FLYOUT_DRAWER_CONTENT_CLASS,
  FlyoutDrawerClose,
} from "@/components/messages/flyout-drawer"
import {
  applicationStatusConfig,
  type MembershipApplication,
} from "@/lib/invites/data"
import { getApplicationResumeSignedUrl } from "@/lib/applications/actions"
import {
  buildSocialHref,
  SOCIAL_FIELD_IDS,
  type SocialFieldId,
} from "@/lib/social-links"
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
import { initials } from "@/lib/users-data"

const SOCIAL_LABELS: Record<SocialFieldId, string> = {
  website: "Website",
  instagram: "Instagram",
  facebook: "Facebook",
  twitter: "X / Twitter",
  linkedin: "LinkedIn",
  youtube: "YouTube",
}

export function ApplicationReviewPanel({
  application,
  open,
  onOpenChange,
  onApprove,
  onDeny,
  approving,
}: {
  application: MembershipApplication | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onApprove: (application: MembershipApplication) => void
  onDeny: (application: MembershipApplication) => void
  approving: boolean
}) {
  const [resumeUrl, setResumeUrl] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !application?.resumeUrl) {
      setResumeUrl(null)
      return
    }

    void getApplicationResumeSignedUrl(application.id).then((result) => {
      setResumeUrl(result.ok ? result.url : null)
    })
  }, [application, open])

  if (!application) return null

  const status = applicationStatusConfig[application.status]
  const socialLinks = SOCIAL_FIELD_IDS.flatMap((id) => {
    const href = buildSocialHref(id, application.socialLinks[id])
    if (!href) return []
    return [{ id, href, label: SOCIAL_LABELS[id] }]
  })

  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
      <DrawerContent className={FLYOUT_DRAWER_CONTENT_CLASS}>
        <FlyoutDrawerClose />
        <DrawerTitle className="sr-only">
          Review application for {application.fullName}
        </DrawerTitle>
        <DrawerDescription className="sr-only">
          Application details, social links, resume, and review actions.
        </DrawerDescription>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="border-b px-4 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-heading text-lg font-semibold">
                  {application.fullName}
                </h2>
                <p className="text-sm text-muted-foreground">{application.email}</p>
                <div className="mt-2 flex flex-col gap-1.5">
                  <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    Titles
                  </p>
                  <ApplicationTitlesBadges title={application.title} />
                </div>
                {application.bio ? (
                  <p className="mt-3 text-sm leading-relaxed text-foreground/90 text-pretty whitespace-pre-line">
                    {application.bio}
                  </p>
                ) : null}
              </div>
              <Badge variant="outline" className={cn("border", status.className)}>
                {status.label}
              </Badge>
            </div>
          </div>

          <div className="space-y-6 px-4 py-4">
            <section className="space-y-2">
              <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Invited by
              </h3>
              {application.source === "request_access" ? (
                <p className="text-sm text-muted-foreground">{application.inviterName}</p>
              ) : (
                <div className="flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarImage src={application.inviterAvatarUrl ?? undefined} />
                    <AvatarFallback>
                      {initials(application.inviterName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{application.inviterName}</p>
                    <p className="text-xs text-muted-foreground">
                      {application.inviterEmail}
                    </p>
                  </div>
                </div>
              )}
            </section>

            <section className="space-y-2">
              <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                Social links
              </h3>
              {socialLinks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No social links provided.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {socialLinks.map((link) => {
                    const Icon = SOCIAL_FIELD_ICONS[link.id]
                    return (
                      <a
                        key={link.id}
                        href={link.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-accent"
                      >
                        <Icon className="size-4" />
                        {link.label}
                        <ExternalLink className="size-3.5 text-muted-foreground" />
                      </a>
                    )
                  })}
                </div>
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
                      <a
                        href={resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                      />
                    }
                  >
                    View
                    <ExternalLink />
                  </Button>
                ) : null}
              </div>
              {resumeUrl ? (
                <iframe
                  title={`Resume for ${application.fullName}`}
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
            </section>
          </div>

          {application.status === "pending" ? (
            <div className="mt-auto flex gap-2 border-t p-4">
              <Button
                className="flex-1"
                disabled={approving}
                onClick={() => onApprove(application)}
              >
                Approve
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                disabled={approving}
                onClick={() => onDeny(application)}
              >
                Deny
              </Button>
            </div>
          ) : null}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
