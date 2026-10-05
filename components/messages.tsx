"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { MessagesSquare } from "lucide-react"

import { type DirectConversation } from "@/lib/messages-data"
import { useArchivedCount } from "@/lib/messages/hooks/use-archived-count"
import { useConversationInboxActions } from "@/lib/messages/hooks/use-conversation-inbox-actions"
import { useInbox } from "@/lib/messages/hooks/use-inbox"
import { useUnreadCount } from "@/lib/messages/hooks/use-unread-count"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { MessagesInbox } from "@/components/messages/messages-inbox"
import { ConversationDeleteDialog } from "@/components/messages/conversation-delete-dialog"
import { useMessages } from "@/components/messages/messages-provider"
import { prefetchThread } from "@/lib/messages/hooks/use-thread"
import { isNavRouteActive } from "@/lib/nav"

export function Messages() {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [inboxMode, setInboxMode] = useState<"main" | "archived">("main")
  const [deleteTarget, setDeleteTarget] =
    useState<DirectConversation | null>(null)
  const [deletePending, setDeletePending] = useState(false)
  const { conversations, markConversationRead } = useMessages()
  const { unreadCount } = useUnreadCount()
  const { isLoading: isInboxLoading } = useInbox({
    enabled: open,
    archived: false,
  })
  const { data: archivedList, isLoading: isArchivedInboxLoading } = useInbox({
    enabled: open && inboxMode === "archived",
    archived: true,
  })
  const { data: archivedCount = 0 } = useArchivedCount({ enabled: open })
  const {
    toggleMute,
    toggleArchive,
    markUnread,
    deleteForMe,
  } = useConversationInboxActions()

  if (isNavRouteActive(pathname, "/messages")) return null

  function navigateToConversation(conversationId: string) {
    setOpen(false)
    setInboxMode("main")
    const url = `/messages?conversation=${encodeURIComponent(conversationId)}`
    if (pathname === "/messages") {
      router.replace(url, { scroll: false })
      return
    }
    router.push(url)
  }

  function handleSelectConversation(conversation: DirectConversation) {
    if (conversation.unread) {
      markConversationRead(conversation.id)
    }

    navigateToConversation(conversation.id)
  }

  async function handleConfirmDeleteConversation() {
    if (!deleteTarget || deletePending) return
    setDeletePending(true)
    try {
      const result = await deleteForMe(deleteTarget.id)
      if (result.ok) setDeleteTarget(null)
    } finally {
      setDeletePending(false)
    }
  }

  const inboxConversations =
    inboxMode === "archived" ? (archivedList ?? []) : conversations

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) setInboxMode("main")
        }}
      >
        <SheetTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="relative"
              aria-label={
                unreadCount > 0 ? `Messages, ${unreadCount} unread` : "Messages"
              }
            />
          }
        >
          <MessagesSquare className="size-5" />
          {unreadCount > 0 ? (
            <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-success text-[10px] font-semibold text-success-foreground">
              {unreadCount}
            </span>
          ) : null}
        </SheetTrigger>

        {open ? (
          <SheetContent
            side="right"
            className="inset-y-3! right-3! h-auto! w-full gap-0 overflow-hidden rounded-2xl border bg-card p-0 text-card-foreground sm:max-w-md"
          >
            <SheetHeader className="shrink-0 flex-row items-center justify-between gap-2 border-b p-4 pr-14">
              <div className="flex items-center gap-2">
                <SheetTitle>Messages</SheetTitle>
                {unreadCount > 0 ? (
                  <span className="rounded-full bg-success/15 px-1.5 py-0.5 text-xs font-medium text-success">
                    {unreadCount} new
                  </span>
                ) : null}
              </div>
            </SheetHeader>

            <MessagesInbox
              conversations={inboxConversations}
              onSelectConversation={handleSelectConversation}
              onPrefetchConversation={prefetchThread}
              isLoading={
                inboxMode === "archived"
                  ? isArchivedInboxLoading
                  : isInboxLoading
              }
              inboxMode={inboxMode}
              archivedCount={archivedCount}
              onShowArchived={() => setInboxMode("archived")}
              onBackToMain={() => setInboxMode("main")}
              onToggleMute={toggleMute}
              onToggleArchive={toggleArchive}
              onMarkUnread={markUnread}
              onRequestDeleteConversation={setDeleteTarget}
            />
          </SheetContent>
        ) : null}
      </Sheet>

      <ConversationDeleteDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(next) => {
          if (!next) setDeleteTarget(null)
        }}
        contactName={deleteTarget?.name ?? "this member"}
        pending={deletePending}
        onConfirm={handleConfirmDeleteConversation}
      />
    </>
  )
}
