"use client"

import { notificationIcons, type AppNotification } from "@/lib/notifications-data"
import { cn } from "@/lib/utils"

export function NotificationList({
  items,
  onToggleRead,
  emptyMessage = "No notifications yet.",
}: {
  items: AppNotification[]
  onToggleRead: (id: string) => void
  emptyMessage?: string
}) {
  if (items.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    )
  }

  return (
    <ul className="flex flex-col">
      {items.map((n) => {
        const Icon = notificationIcons[n.kind]
        return (
          <li key={n.id}>
            <button
              type="button"
              onClick={() => onToggleRead(n.id)}
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
  )
}
