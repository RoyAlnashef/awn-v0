"use client"

import { useEffect, useState, useTransition } from "react"
import { Ban, Flag, MessageSquare, MessagesSquare, Plus, UserGroup, UserMinus } from "lucide-react"
import { toast } from "sonner"

import type { Person } from "@/lib/people-data"
import { toggleConnection } from "@/lib/people/actions"
import {
  blockMember,
  getMemberModerationState,
  submitMemberReport,
  unblockMember,
} from "@/lib/moderation/actions"
import {
  MEMBER_REPORT_REASONS,
  isMemberReportReason,
  memberReportReasonLabel,
} from "@/lib/moderation/report-reasons"
import { JobActionTooltip } from "@/components/jobs/job-action-tooltip"
import { ShareToMessagesDrawer } from "@/components/messages/share-to-messages-flyout"
import { ShareToRoomsDrawer } from "@/components/rooms/share-to-rooms-flyout"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const footerSheetClassName =
  "flex shrink-0 flex-col gap-3 border-t bg-popover p-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-300 ease-out"

type FooterMode = "actions" | "report" | "thanks"

export function PersonProfileInteractiveFooter({
  person,
  followed: initialFollowed,
  onMessage,
  viewerProfileId,
}: {
  person: Person
  followed: boolean
  onMessage?: () => void
  viewerProfileId?: string
}) {
  const isSelf = viewerProfileId != null && person.id === viewerProfileId
  const [followed, setFollowed] = useState(initialFollowed)
  const [shareOpen, setShareOpen] = useState(false)
  const [shareRoomOpen, setShareRoomOpen] = useState(false)
  const [footerMode, setFooterMode] = useState<FooterMode>("actions")
  const [reason, setReason] = useState<string>("")
  const [isBlocked, setIsBlocked] = useState(false)
  const [hasOpenReport, setHasOpenReport] = useState(false)
  const [blockDialogOpen, setBlockDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setFollowed(initialFollowed)
  }, [initialFollowed, person.id])

  useEffect(() => {
    if (isSelf) return
    void getMemberModerationState(person.id).then((result) => {
      if (!result.ok) return
      setIsBlocked(result.isBlocked)
      setHasOpenReport(result.hasOpenReport)
    })
  }, [person.id, isSelf])

  function handleFollowToggle() {
    startTransition(async () => {
      const result = await toggleConnection(person.id, followed)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      setFollowed(result.connected)
    })
  }

  function handleBlockConfirm() {
    startTransition(async () => {
      const result = await blockMember(person.id)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      setIsBlocked(true)
      setBlockDialogOpen(false)
      toast.success(`${person.name} has been blocked.`)
    })
  }

  function handleUnblock() {
    startTransition(async () => {
      const result = await unblockMember(person.id)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      setIsBlocked(false)
      toast.success(`${person.name} has been unblocked.`)
    })
  }

  function handleSubmitReport() {
    if (!reason) {
      toast.error("Select a reason for your report.")
      return
    }
    startTransition(async () => {
      const result = await submitMemberReport(person.id, reason)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      setHasOpenReport(true)
      setFooterMode("thanks")
    })
  }

  if (isSelf) {
    return null
  }

  if (footerMode === "thanks") {
    return (
      <div className={footerSheetClassName}>
        <p className="text-sm font-medium">Thank you.</p>
        <p className="text-sm text-muted-foreground">
          Your report has been received and will be reviewed by AWN.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() => {
            setReason("")
            setFooterMode("actions")
          }}
        >
          Done
        </Button>
      </div>
    )
  }

  if (footerMode === "report") {
    return (
      <div className={footerSheetClassName}>
        <p className="text-sm font-medium">Report {person.name}</p>
        <div className="flex flex-col gap-2">
          <Label htmlFor="report-reason" className="font-normal text-muted-foreground">
            Why are you reporting this member?
          </Label>
          <Select value={reason} onValueChange={(value) => value && setReason(value)}>
            <SelectTrigger id="report-reason" className="w-full">
              <SelectValue placeholder="Select a reason…">
                {(value) =>
                  value && isMemberReportReason(value)
                    ? memberReportReasonLabel(value)
                    : value
                }
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {MEMBER_REPORT_REASONS.map((entry) => (
                <SelectItem key={entry.value} value={entry.value}>
                  {entry.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            className="shrink-0 text-muted-foreground"
            disabled={isPending}
            onClick={() => {
              setReason("")
              setFooterMode("actions")
            }}
          >
            Cancel
          </Button>
          <Button
            className="min-w-0 flex-1"
            disabled={isPending || !reason}
            onClick={handleSubmitReport}
          >
            Submit report
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="relative z-10 flex shrink-0 items-center gap-2 border-t bg-card p-4">
        <DropdownMenu>
          <JobActionTooltip label="Report this member" wrap>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Report this member"
                  disabled={isPending}
                >
                  <Flag className="size-4" />
                </Button>
              }
            />
          </JobActionTooltip>
          <DropdownMenuContent align="start" side="top" sideOffset={6}>
            {hasOpenReport ? (
              <DropdownMenuItem disabled>
                <Flag />
                Report submitted
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                disabled={isPending}
                onClick={() => setFooterMode("report")}
              >
                <Flag />
                Report member
              </DropdownMenuItem>
            )}
            {isBlocked ? (
              <DropdownMenuItem disabled={isPending} onClick={handleUnblock}>
                <Ban />
                Unblock member
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                disabled={isPending}
                onClick={() => setBlockDialogOpen(true)}
              >
                <Ban />
                Block member
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <JobActionTooltip label="Share as a message" wrap>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Share as a message"
            onClick={() => setShareOpen(true)}
          >
            <MessagesSquare className="size-4" />
          </Button>
        </JobActionTooltip>
        <JobActionTooltip label="Share to a group" wrap>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Share to a group"
            onClick={() => setShareRoomOpen(true)}
          >
            <UserGroup className="size-4" />
          </Button>
        </JobActionTooltip>
        <JobActionTooltip label={followed ? "Disconnect" : "Connect"}>
          <Button
            variant="ghost"
            size="icon"
            aria-label={followed ? "Disconnect" : "Connect"}
            aria-pressed={followed}
            disabled={isPending || isBlocked}
            onClick={handleFollowToggle}
          >
            {followed ? <UserMinus /> : <Plus />}
          </Button>
        </JobActionTooltip>
        <JobActionTooltip
          label={
            isBlocked
              ? "Open your existing conversation from Messages"
              : "Message"
          }
        >
          <Button
            className="min-w-0 flex-1 shrink"
            disabled={isBlocked}
            onClick={onMessage}
          >
            <MessageSquare />
            Message
          </Button>
        </JobActionTooltip>
      </div>

      <ShareToMessagesDrawer
        open={shareOpen}
        onOpenChange={setShareOpen}
        shareMember={person.id}
        shareLabel={person.name}
      />
      <ShareToRoomsDrawer
        open={shareRoomOpen}
        onOpenChange={setShareRoomOpen}
        shareMember={person.id}
        shareLabel={person.name}
      />

      <AlertDialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block {person.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              You will not see each other in People, Now, or group chats. Existing
              direct messages stay in your inbox, but neither of you can send new
              messages.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBlockConfirm}>
              Block member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
