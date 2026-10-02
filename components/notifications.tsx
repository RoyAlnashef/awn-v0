"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, Check } from "lucide-react"

import { UrgentJobsCarousel } from "@/components/jobs/jobs-panel/urgent-jobs-carousel"
import { NotificationList } from "@/components/notifications/notification-list"
import { useMessages } from "@/components/messages/messages-provider"
import {
  getJobNotificationConversationId,
  getRoomNotificationRoomId,
  isJobApplicantsSectionNotification,
  isJobApiNotification,
  isJobPosterManagementNotification,
  isMentionTabNotification,
  isPanelNotification,
  isRoomJoinRequestNotification,
  isRoomMentionNotification,
  isRoomReplyNotification,
  type AppNotification,
} from "@/lib/notifications-data"
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications/actions"
import { useNotifications } from "@/lib/notifications/hooks/use-notifications"
import { useNotificationsRealtime } from "@/lib/notifications/hooks/use-notifications-realtime"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type NotificationTab = "all" | "jobs" | "mentions"

export function Notifications() {
  const router = useRouter()
  const { currentUser } = useMessages()
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<NotificationTab>("all")
  const { notifications, mutate, isLoading } = useNotifications()

  useNotificationsRealtime({ userId: currentUser.id })

  const panelNotifications = notifications.filter(isPanelNotification)
  const jobNotifications = panelNotifications.filter((n) =>
    isJobApiNotification(n.dbKind),
  )
  const unreadCount = panelNotifications.filter((n) => !n.read).length
  const jobUnreadCount = jobNotifications.filter((n) => !n.read).length

  const mentions = panelNotifications.filter(isMentionTabNotification)
  const mentionsUnreadCount = mentions.filter((n) => !n.read).length

  async function markAllRead() {
    const previous = notifications

    await mutate(
      previous.map((n) =>
        isPanelNotification(n) ? { ...n, read: true } : n,
      ),
      { revalidate: false },
    )

    const result = await markAllNotificationsRead()
    if (!result.ok) {
      await mutate(previous, { revalidate: false })
      return
    }

    void mutate()
  }

  async function markReadOnly(item: AppNotification) {
    if (item.read) return

    const previous = notifications

    await mutate(
      previous.map((n) => (n.id === item.id ? { ...n, read: true } : n)),
      { revalidate: false },
    )

    const result = await markNotificationRead(item.id, true)
    if (!result.ok) {
      await mutate(previous, { revalidate: false })
      return
    }

    void mutate()
  }

  async function handleConversationNotificationClick(
    item: AppNotification,
    conversationId: string,
  ) {
    const previous = notifications

    await mutate(
      previous.map((n) => (n.id === item.id ? { ...n, read: true } : n)),
      { revalidate: false },
    )

    const result = await markNotificationRead(item.id, true)
    if (!result.ok) {
      await mutate(previous, { revalidate: false })
      return
    }

    setOpen(false)
    router.push(`/messages?conversation=${encodeURIComponent(conversationId)}`)
    void mutate()
  }

  async function handleRoomNotificationClick(
    item: AppNotification,
    roomId: string,
  ) {
    const previous = notifications

    await mutate(
      previous.map((n) => (n.id === item.id ? { ...n, read: true } : n)),
      { revalidate: false },
    )

    const result = await markNotificationRead(item.id, true)
    if (!result.ok) {
      await mutate(previous, { revalidate: false })
      return
    }

    setOpen(false)
    const messageId = item.data?.latestMessageId
    const url = messageId
      ? `/rooms?room=${encodeURIComponent(roomId)}&message=${encodeURIComponent(messageId)}`
      : `/rooms?room=${encodeURIComponent(roomId)}`
    router.push(url)
    void mutate()
  }

  async function handleRoomJoinRequestClick(item: AppNotification, roomId: string) {
    const previous = notifications

    await mutate(
      previous.map((n) => (n.id === item.id ? { ...n, read: true } : n)),
      { revalidate: false },
    )

    const result = await markNotificationRead(item.id, true)
    if (!result.ok) {
      await mutate(previous, { revalidate: false })
      return
    }

    setOpen(false)
    router.push(
      `/groups/settings?room=${encodeURIComponent(roomId)}&members=1`,
    )
    void mutate()
  }

  function handleNotificationClick(item: AppNotification) {
    if (isRoomJoinRequestNotification(item)) {
      const roomId = getRoomNotificationRoomId(item)
      if (roomId) {
        void handleRoomJoinRequestClick(item, roomId)
        return
      }
    }

    const roomId =
      isRoomMentionNotification(item) || isRoomReplyNotification(item)
        ? getRoomNotificationRoomId(item)
        : undefined
    if (roomId) {
      void handleRoomNotificationClick(item, roomId)
      return
    }

    const jobConversationId = isJobApiNotification(item.dbKind)
      ? getJobNotificationConversationId(item)
      : undefined
    if (jobConversationId) {
      void handleConversationNotificationClick(item, jobConversationId)
      return
    }

    if (isJobApiNotification(item.dbKind) && item.data?.jobId) {
      const jobId = item.data.jobId
      const destination = isJobPosterManagementNotification(item.dbKind)
        ? isJobApplicantsSectionNotification(item.dbKind)
          ? `/jobs/${jobId}#job-applicants`
          : `/jobs/${jobId}`
        : "/my-jobs/applications"
      void (async () => {
        const previous = notifications
        await mutate(
          previous.map((n) => (n.id === item.id ? { ...n, read: true } : n)),
          { revalidate: false },
        )
        const result = await markNotificationRead(item.id, true)
        if (!result.ok) {
          await mutate(previous, { revalidate: false })
          return
        }
        setOpen(false)
        router.push(destination)
        void mutate()
      })()
      return
    }

    void markReadOnly(item)
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
              unreadCount > 0
                ? `Notifications, ${unreadCount} unread`
                : "Notifications"
            }
          />
        }
      >
        <Bell className="size-5" />
        {unreadCount > 0 ? (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-notification text-[10px] font-semibold text-notification-foreground">
            {unreadCount}
          </span>
        ) : null}
      </SheetTrigger>

      {open ? (
        <SheetContent
          side="right"
          className="inset-y-3! right-3! flex h-auto! w-full flex-col gap-0 overflow-hidden rounded-2xl border bg-card p-0 text-card-foreground sm:max-w-md"
        >
          <SheetHeader className="shrink-0 flex-row items-center justify-between gap-2 border-b p-4 pr-14">
            <div className="flex items-center gap-2">
              <SheetTitle>Notifications</SheetTitle>
              {unreadCount > 0 ? (
                <span className="rounded-full bg-notification/15 px-1.5 py-0.5 text-xs font-medium text-notification">
                  {unreadCount}
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

          <Tabs
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as NotificationTab)}
            className="flex min-h-0 flex-1 flex-col gap-0"
          >
            <div className="shrink-0 px-3 py-3">
              <TabsList className="flex h-9 w-full items-center rounded-md bg-transparent border border-border px-0.75 py-1">
                <TabsTrigger
                  value="all"
                  className="h-7 flex-1 text-xs sm:text-sm rounded-sm"
                >
                  All
                </TabsTrigger>
                <TabsTrigger
                  value="jobs"
                  className="h-7 flex-1 text-xs sm:text-sm rounded-sm" 
                >
                  Jobs
                  {jobUnreadCount > 0 ? (
                    <span className="text-muted-foreground">{jobUnreadCount}</span>
                  ) : null}
                </TabsTrigger>
                <TabsTrigger
                  value="mentions"
                  className="h-7 flex-1 text-xs sm:text-sm rounded-sm"
                >
                  Mentions
                  {mentionsUnreadCount > 0 ? (
                    <span className="text-muted-foreground">
                      {mentionsUnreadCount}
                    </span>
                  ) : null}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="mt-0 min-h-0 flex-1">
              <ScrollArea className="h-full min-h-0">
                {isLoading && panelNotifications.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Loading notifications…
                  </p>
                ) : (
                  <NotificationList
                    items={panelNotifications}
                    onItemClick={handleNotificationClick}
                  />
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="jobs" className="mt-0 min-h-0 flex-1">
              <ScrollArea className="h-full min-h-0">
                <UrgentJobsCarousel enabled={open} />
                {isLoading && jobNotifications.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Loading notifications…
                  </p>
                ) : (
                  <NotificationList
                    items={jobNotifications}
                    onItemClick={handleNotificationClick}
                    emptyMessage="No job notifications yet."
                  />
                )}
              </ScrollArea>
            </TabsContent>

            <TabsContent value="mentions" className="mt-0 min-h-0 flex-1">
              <ScrollArea className="h-full min-h-0">
                {isLoading && mentions.length === 0 ? (
                  <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                    Loading notifications…
                  </p>
                ) : (
                  <NotificationList
                    items={mentions}
                    onItemClick={handleNotificationClick}
                    emptyMessage="No mentions yet."
                  />
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>

          {activeTab === "jobs" ? (
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
          ) : null}
        </SheetContent>
      ) : null}
    </Sheet>
  )
}
