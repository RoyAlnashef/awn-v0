"use client"

import { useState } from "react"
import { Bell, Check } from "lucide-react"

import { notificationIcons } from "@/lib/notifications-data"
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications/actions"
import { useNotifications } from "@/lib/notifications/hooks/use-notifications"
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
  const { notifications, mutate, isLoading } = useNotifications()
  const unreadCount = notifications.filter((n) => !n.read).length

  async function markAllRead() {
    const previous = notifications

    await mutate(
      previous.map((n) => ({ ...n, read: true })),
      { revalidate: false },
    )

    const result = await markAllNotificationsRead()
    if (!result.ok) {
      await mutate(previous, { revalidate: false })
      return
    }

    void mutate()
  }

  async function toggleRead(id: string) {
    const item = notifications.find((n) => n.id === id)
    if (!item) return

    const nextRead = !item.read
    const previous = notifications

    await mutate(
      previous.map((n) => (n.id === id ? { ...n, read: nextRead } : n)),
      { revalidate: false },
    )

    const result = await markNotificationRead(id, nextRead)
    if (!result.ok) {
      await mutate(previous, { revalidate: false })
      return
    }

    void mutate()
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
          <span className="absolute top-1 right-1 flex min-w-4 items-center justify-center rounded-full bg-notification px-1 text-[10px] font-semibold text-notification-foreground ring-2 ring-background">
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
                <span className="rounded-full bg-notification/15 px-1.5 py-0.5 text-xs font-medium text-notification">
                  {unreadCount} new
                </span>
              ) : null}
            </div>
            {unreadCount > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-1 text-xs"
                onClick={() => void markAllRead()}
              >
                <Check className="size-3.5" />
                Mark all read
              </Button>
            ) : null}
          </SheetHeader>

          <ScrollArea className="min-h-0 flex-1">
            {isLoading && notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                Loading notifications…
              </p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                No notifications yet.
              </p>
            ) : (
              <ul className="flex flex-col">
                {notifications.map((n) => {
                  const Icon = notificationIcons[n.kind]
                  return (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => void toggleRead(n.id)}
                        aria-label={
                          n.read
                            ? `${n.title}. Mark as unread.`
                            : `${n.title}. Mark as read.`
                        }
                        className={cn(
                          "relative flex w-full items-start gap-3 border-b px-4 py-3.5 text-left transition-colors last:border-b-0 hover:bg-accent/60",
                          !n.read && "bg-notification/6",
                        )}
                      >
                        {!n.read ? (
                          <span
                            aria-hidden="true"
                            className="absolute inset-y-0 left-0 w-0.5 bg-notification"
                          />
                        ) : null}

                        <span
                          className={cn(
                            "flex size-9 shrink-0 items-center justify-center rounded-full",
                            n.read
                              ? "bg-muted text-muted-foreground"
                              : "bg-notification/15 text-notification",
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
                                className="mt-1.5 size-2 shrink-0 rounded-full bg-notification"
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
            )}
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
