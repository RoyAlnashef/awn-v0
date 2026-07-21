"use client"

import { MessagesSquare } from "lucide-react"

import { directConversations } from "@/lib/messages-data"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { MessagesInbox } from "@/components/messages/messages-inbox"

export function Messages() {
  const unreadCount = directConversations.filter((c) => c.unread).length

  return (
    <Sheet>
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
          <span className="absolute top-1 right-1 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground ring-2 ring-background">
            {unreadCount}
          </span>
        ) : null}
      </SheetTrigger>

      <SheetContent
        side="right"
        className="inset-y-3! right-3! h-auto! w-full gap-0 overflow-hidden rounded-2xl border p-0 sm:max-w-md"
      >
        <SheetHeader className="shrink-0 flex-row items-center justify-between gap-2 border-b p-4 pr-14">
          <div className="flex items-center gap-2">
            <SheetTitle>Messages</SheetTitle>
            {unreadCount > 0 ? (
              <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-xs font-medium text-primary">
                {unreadCount} new
              </span>
            ) : null}
          </div>
        </SheetHeader>

        <MessagesInbox />
      </SheetContent>
    </Sheet>
  )
}
