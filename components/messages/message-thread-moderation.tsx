"use client"

import { useEffect, useState, useTransition } from "react"
import { Ban, EllipsisVertical, Flag } from "lucide-react"
import { toast } from "sonner"

import { useIsMobile } from "@/hooks/use-mobile"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"

function MemberReportReasonSelect({
  reason,
  onReasonChange,
  reasonFieldId,
}: {
  reason: string
  onReasonChange: (value: string) => void
  reasonFieldId: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label
        htmlFor={reasonFieldId}
        className="font-normal text-muted-foreground"
      >
        Why are you reporting this member?
      </Label>
      <Select
        value={reason}
        onValueChange={(value) => value && onReasonChange(value)}
      >
        <SelectTrigger id={reasonFieldId} className="w-full">
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
  )
}

function MemberReportFormActions({
  isPending,
  reason,
  onCancel,
  onSubmit,
}: {
  isPending: boolean
  reason: string
  onCancel: () => void
  onSubmit: () => void
}) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        className="shrink-0 text-muted-foreground"
        disabled={isPending}
        onClick={onCancel}
      >
        Cancel
      </Button>
      <Button
        className="min-w-0 flex-1"
        disabled={isPending || !reason}
        onClick={onSubmit}
      >
        Submit report
      </Button>
    </div>
  )
}

function MemberReportFormBody({
  memberName,
  reason,
  onReasonChange,
  isPending,
  onCancel,
  onSubmit,
  reasonFieldId,
}: {
  memberName: string
  reason: string
  onReasonChange: (value: string) => void
  isPending: boolean
  onCancel: () => void
  onSubmit: () => void
  reasonFieldId: string
}) {
  return (
    <>
      <p className="text-sm font-medium">Report {memberName}</p>
      <MemberReportReasonSelect
        reason={reason}
        onReasonChange={onReasonChange}
        reasonFieldId={reasonFieldId}
      />
      <MemberReportFormActions
        isPending={isPending}
        reason={reason}
        onCancel={onCancel}
        onSubmit={onSubmit}
      />
    </>
  )
}

export function MessageThreadModeration({
  memberId,
  memberName,
  onModerationChange,
  onReportOpen,
}: {
  memberId: string
  memberName: string
  onModerationChange?: () => void
  /** e.g. close profile drawer so it does not sit under the report sheet */
  onReportOpen?: () => void
}) {
  const isMobile = useIsMobile()
  const [isBlocked, setIsBlocked] = useState(false)
  const [hasOpenReport, setHasOpenReport] = useState(false)
  const [reportOpen, setReportOpen] = useState(false)
  const [blockDialogOpen, setBlockDialogOpen] = useState(false)
  const [reason, setReason] = useState("")
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    void getMemberModerationState(memberId).then((result) => {
      if (!result.ok) return
      setIsBlocked(result.isBlocked)
      setHasOpenReport(result.hasOpenReport)
    })
  }, [memberId])

  function closeReport() {
    setReportOpen(false)
    setReason("")
  }

  function handleSubmitReport() {
    if (!reason) {
      toast.error("Select a reason for your report.")
      return
    }
    startTransition(async () => {
      const result = await submitMemberReport(memberId, reason)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      setHasOpenReport(true)
      closeReport()
      toast.success("Your report has been received and will be reviewed by AWN.")
      onModerationChange?.()
    })
  }

  function handleBlockConfirm() {
    startTransition(async () => {
      const result = await blockMember(memberId)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      setIsBlocked(true)
      setBlockDialogOpen(false)
      toast.success(`${memberName} has been blocked.`)
      onModerationChange?.()
    })
  }

  function handleUnblock() {
    startTransition(async () => {
      const result = await unblockMember(memberId)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      setIsBlocked(false)
      toast.success(`${memberName} has been unblocked.`)
      onModerationChange?.()
    })
  }

  const reportFormProps = {
    memberName,
    reason,
    onReasonChange: setReason,
    isPending,
    onCancel: closeReport,
    onSubmit: handleSubmitReport,
    reasonFieldId: "thread-report-reason",
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground hover:text-foreground"
              aria-label={`Actions for ${memberName}`}
              disabled={isPending}
            >
              <EllipsisVertical />
            </Button>
          }
        />
        <DropdownMenuContent align="end">
          {hasOpenReport ? (
            <DropdownMenuItem disabled>
              <Flag />
              Report submitted
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              disabled={isPending}
              onClick={() => {
                onReportOpen?.()
                setReportOpen(true)
              }}
            >
              <Flag />
              Report
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

      {isMobile ? (
        <Drawer
          open={reportOpen}
          onOpenChange={(open) => {
            if (!open) closeReport()
            else setReportOpen(true)
          }}
          showSwipeHandle
          swipeDirection="down"
        >
          {reportOpen ? (
            <DrawerContent className="max-h-[85vh] gap-0 p-0">
              <DrawerHeader className="shrink-0 text-left group-data-[swipe-axis=y]/drawer-popup:text-left">
                <DrawerTitle className="w-full text-left font-sans text-base font-semibold">
                  Report {memberName}
                </DrawerTitle>
              </DrawerHeader>
              <div className="min-h-0 shrink-0 px-4 pb-4 text-left">
                <MemberReportReasonSelect
                  reason={reason}
                  onReasonChange={setReason}
                  reasonFieldId={reportFormProps.reasonFieldId}
                />
              </div>
              <DrawerFooter className="flex-row items-center gap-2 pb-[max(1.5rem,env(safe-area-inset-bottom))] [&>div]:w-full">
                <MemberReportFormActions
                  isPending={isPending}
                  reason={reason}
                  onCancel={closeReport}
                  onSubmit={handleSubmitReport}
                />
              </DrawerFooter>
            </DrawerContent>
          ) : null}
        </Drawer>
      ) : (
        <Dialog
          open={reportOpen}
          onOpenChange={(open) => {
            if (!open) closeReport()
            else setReportOpen(true)
          }}
        >
          <DialogContent className="gap-4 sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="sr-only">Report {memberName}</DialogTitle>
            </DialogHeader>
            <MemberReportFormBody {...reportFormProps} />
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={blockDialogOpen} onOpenChange={setBlockDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block {memberName}?</AlertDialogTitle>
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
