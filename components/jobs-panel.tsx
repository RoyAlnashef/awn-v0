"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Briefcase, Check } from "lucide-react"

import { JobsNotificationsList } from "@/components/jobs/jobs-panel/jobs-notifications-list"
import { UrgentJobsCarousel } from "@/components/jobs/jobs-panel/urgent-jobs-carousel"
import { jobPanelNotifications as initialJobPanelNotifications } from "@/lib/jobs-panel-data"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

export function JobsPanel() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState(initialJobPanelNotifications)
  const unreadCount = items.filter((n) => !n.read).length

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  function toggleRead(id: string) {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)),
    )
  }

  function viewAllJobs() {
    setOpen(false)
    router.push("/jobs")
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
              unreadCount > 0 ? `Jobs, ${unreadCount} unread` : "Jobs"
            }
          />
        }
      >
        <Briefcase className="size-5" />
        {unreadCount > 0 ? (
          <span className="absolute top-1 right-1 flex min-w-4 items-center justify-center rounded-full bg-notification px-1 text-[10px] font-semibold text-notification-foreground ring-2 ring-background">
            {unreadCount}
          </span>
        ) : null}
      </SheetTrigger>

      {open ? (
        <SheetContent
          side="right"
          className="inset-y-3! right-3! flex h-auto! w-full flex-col gap-0 overflow-hidden rounded-2xl border p-0 sm:max-w-md"
        >
          <SheetHeader className="shrink-0 flex-row items-center justify-between gap-2 border-b p-4 pr-14">
            <div className="flex items-center gap-2">
              <SheetTitle>Jobs</SheetTitle>
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
                onClick={markAllRead}
              >
                <Check className="size-3.5" />
                Mark all read
              </Button>
            ) : null}
          </SheetHeader>

          <UrgentJobsCarousel enabled={open} />

          <ScrollArea className="min-h-0 flex-1">
            <JobsNotificationsList items={items} onToggleRead={toggleRead} />
          </ScrollArea>

          <div className="shrink-0 border-t p-3">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-sm"
              onClick={viewAllJobs}
            >
              View all jobs
            </Button>
          </div>
        </SheetContent>
      ) : null}
    </Sheet>
  )
}
