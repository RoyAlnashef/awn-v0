"use client"

import { useState } from "react"
import { Bell, Check } from "lucide-react"

import {
  notifications as initialNotifications,
  notificationIcons,
} from "@/lib/notifications-data"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"

export function Notifications() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState(initialNotifications)
  const unreadCount = items.filter((n) => !n.read).length

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  function toggleRead(id: string) {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)),
    )
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
              unreadCount > 0
                ? `Notifications, ${unreadCount} unread`
                : "Notifications"
            }
          />
        }
      >
        <Bell className="size-5" />
        {unreadCount > 0 ? (
          <span className="absolute top-1 right-1 flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground ring-2 ring-background">
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
              <SheetTitle>Notifications</SheetTitle>
              {unreadCount > 0 ? (
                <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-xs font-medium text-primary">
                  {unreadCount} new
                </span>
              ) : null}
            </div>
            {unreadCount > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-1 text-xs"
                onClick={markAllRead}
              >
                <Check className="size-3.5" />
                Mark all read
              </Button>
            ) : null}
          </SheetHeader>

          <ScrollArea className="min-h-0 flex-1">
            <ul className="flex flex-col">
              {items.map((n) => {
                const Icon = notificationIcons[n.kind]
                return (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => toggleRead(n.id)}
                      aria-label={
                        n.read
                          ? `${n.title}. Mark as unread.`
                          : `${n.title}. Mark as read.`
                      }
                      className={cn(
                        "relative flex w-full items-start gap-3 border-b px-4 py-3.5 text-left transition-colors last:border-b-0 hover:bg-accent/60",
                        !n.read && "bg-primary/[0.06]",
                      )}
                    >
                      {!n.read ? (
                        <span
                          aria-hidden="true"
                          className="absolute inset-y-0 left-0 w-0.5 bg-primary"
                        />
                      ) : null}

                      <span
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-full",
                          n.read
                            ? "bg-muted text-muted-foreground"
                            : "bg-primary/15 text-primary",
                        )}
                      >
                        <Icon className="size-4" />
                      </span>

                      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={cn(
                              "text-sm leading-snug text-pretty",
                              n.read
                                ? "font-normal text-muted-foreground"
                                : "font-medium text-foreground",
                            )}
                          >
                            {n.title}
                          </p>
                          {!n.read ? (
                            <span
                              aria-hidden="true"
                              className="mt-1.5 size-2 shrink-0 rounded-full bg-primary"
                            />
                          ) : null}
                        </div>
                        <p className="line-clamp-2 text-xs leading-snug text-muted-foreground text-pretty">
                          {n.body}
                        </p>
                        <span className="mt-0.5 text-[11px] text-muted-foreground/80">
                          {n.time}
                        </span>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          </ScrollArea>

          <div className="shrink-0 border-t p-3">
            <SheetClose
              render={
                <Button variant="ghost" size="sm" className="w-full text-sm" />
              }
            >
              View all notifications
            </SheetClose>
          </div>
        </SheetContent>
      ) : null}
    </Sheet>
  )
}
