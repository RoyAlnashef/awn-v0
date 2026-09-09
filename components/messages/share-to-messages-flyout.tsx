"use client"

import {
  cloneElement,
  useCallback,
  useState,
  type MouseEvent,
  type ReactElement,
} from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import {
  FLYOUT_DRAWER_CONTENT_CLASS,
  FlyoutDrawerClose,
} from "@/components/messages/flyout-drawer"
import { NewMessageDrawerPanel } from "@/components/messages/new-message-drawer"
import { useMessages } from "@/components/messages/messages-provider"
import { messageThreadWithSharePath } from "@/lib/messages/share-navigation"
import type { MessageableMember } from "@/lib/messages-data"
import {
  Drawer,
  DrawerContent,
} from "@/components/ui/drawer"

type ShareContext = { kind: "job" | "member"; label: string }

function buildShareContext(
  shareJob: string | undefined,
  shareMember: string | undefined,
  shareLabel: string,
): ShareContext | undefined {
  if (shareJob) {
    return { kind: "job", label: shareLabel }
  }
  if (shareMember) {
    return { kind: "member", label: shareLabel }
  }
  return undefined
}

export function useShareToMessages({
  shareJob,
  shareMember,
  onClose,
}: {
  shareJob?: string
  shareMember?: string
  onClose?: () => void
}) {
  const router = useRouter()
  const { ensureConversation } = useMessages()

  const handleSelectMember = useCallback(
    (member: MessageableMember) => {
      void ensureConversation(member).then((result) => {
        if (!result.ok) {
          toast.error(result.error)
          return
        }

        onClose?.()
        router.push(
          messageThreadWithSharePath({
            conversationId: result.conversation.id,
            shareJob,
            shareMember,
          }),
        )
      })
    },
    [ensureConversation, onClose, router, shareJob, shareMember],
  )

  return { handleSelectMember }
}

export function ShareToMessagesDrawer({
  open,
  onOpenChange,
  shareJob,
  shareMember,
  shareLabel,
  onSelectComplete,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  shareJob?: string
  shareMember?: string
  shareLabel: string
  onSelectComplete?: () => void
}) {
  const shareContext = buildShareContext(shareJob, shareMember, shareLabel)

  const { handleSelectMember } = useShareToMessages({
    shareJob,
    shareMember,
    onClose: () => {
      onOpenChange(false)
      onSelectComplete?.()
    },
  })

  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
      {open ? (
        <DrawerContent className={FLYOUT_DRAWER_CONTENT_CLASS}>
          <FlyoutDrawerClose />
          <NewMessageDrawerPanel
            open={open}
            onSelectMember={handleSelectMember}
            shareContext={shareContext}
          />
        </DrawerContent>
      ) : null}
    </Drawer>
  )
}

type ClickableChild = ReactElement<{
  onClick?: (event: MouseEvent<HTMLElement>) => void
}>

export function ShareToMessagesFlyout({
  shareJob,
  shareMember,
  shareLabel,
  children,
}: {
  shareJob?: string
  shareMember?: string
  shareLabel: string
  children: ClickableChild
}) {
  const [open, setOpen] = useState(false)

  function handleOpen(event: MouseEvent<HTMLElement>) {
    children.props.onClick?.(event)
    if (!event.defaultPrevented) {
      setOpen(true)
    }
  }

  return (
    <>
      {cloneElement(children, { onClick: handleOpen })}
      <ShareToMessagesDrawer
        open={open}
        onOpenChange={setOpen}
        shareJob={shareJob}
        shareMember={shareMember}
        shareLabel={shareLabel}
      />
    </>
  )
}
