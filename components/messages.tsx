"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { MessagesSquare } from "lucide-react"

import { type DirectConversation } from "@/lib/messages-data"
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
import { useMessages } from "@/components/messages/messages-provider"
import { prefetchThread } from "@/lib/messages/hooks/use-thread"

export function Messages() {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { conversations, markConversationRead } = useMessages()
  const { unreadCount } = useUnreadCount()
  const { isLoading: isInboxLoading } = useInbox({ enabled: open })

  function navigateToConversation(conversationId: string) {
    setOpen(false)
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

  return (
    <Sheet open={open} onOpenChange={setOpen}>
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
          <span className="absolute top-1 right-1 flex min-w-4 items-center justify-center rounded-full bg-success px-1 text-[10px] font-semibold text-success-foreground ring-2 ring-background">
            {unreadCount}
          </span>
        ) : null}
      </SheetTrigger>

      {open ? (
        <SheetContent
          side="right"
          className="inset-y-3! right-3! h-auto! w-full gap-0 overflow-hidden rounded-2xl border p-0 sm:max-w-md"
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
            conversations={conversations}
            onSelectConversation={handleSelectConversation}
            onPrefetchConversation={prefetchThread}
            isLoading={isInboxLoading}
          />
        </SheetContent>
      ) : null}
    </Sheet>
  )
}
