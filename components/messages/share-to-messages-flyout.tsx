"use client"

import {
  cloneElement,
  useState,
  type MouseEvent,
  type ReactElement,
} from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { NewMessageDrawerPanel } from "@/components/messages/new-message-drawer"
import { useMessages } from "@/components/messages/messages-provider"
import { messageThreadWithSharePath } from "@/lib/messages/share-navigation"
import type { MessageableMember } from "@/lib/messages-data"
import { Sheet, SheetContent } from "@/components/ui/sheet"

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
  const router = useRouter()
  const { ensureConversation } = useMessages()
  const [open, setOpen] = useState(false)

  const shareContext = shareJob
    ? { kind: "job" as const, label: shareLabel }
    : shareMember
      ? { kind: "member" as const, label: shareLabel }
      : undefined

  function handleOpen(event: MouseEvent<HTMLElement>) {
    children.props.onClick?.(event)
    if (!event.defaultPrevented) {
      setOpen(true)
    }
  }

  function handleSelectMember(member: MessageableMember) {
    void ensureConversation(member).then((result) => {
      if (!result.ok) {
        toast.error(result.error)
        return
      }

      setOpen(false)
      router.push(
        messageThreadWithSharePath({
          conversationId: result.conversation.id,
          shareJob,
          shareMember,
        }),
      )
    })
  }

  return (
    <>
      {cloneElement(children, { onClick: handleOpen })}
      <Sheet open={open} onOpenChange={setOpen}>
        {open ? (
          <SheetContent
            side="right"
            className="inset-y-3! right-3! h-auto! w-full gap-0 overflow-hidden rounded-2xl border p-0 sm:max-w-md"
          >
            <NewMessageDrawerPanel
              open={open}
              onSelectMember={handleSelectMember}
              shareContext={shareContext}
            />
          </SheetContent>
        ) : null}
      </Sheet>
    </>
  )
}
