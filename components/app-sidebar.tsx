"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { NavUser, type NavUserData } from "@/components/nav-user"
import { useFeedbackNewCount } from "@/lib/feedback/hooks/use-feedback-new-count"
import { useUnreadCount } from "@/lib/messages/hooks/use-unread-count"
import { useRoomsUnreadCount } from "@/lib/rooms/hooks/use-rooms-unread-count"
import { mainNav, adminNav, type NavItem } from "@/lib/nav"
import { cn } from "@/lib/utils"

function isSubActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

function isSectionActive(pathname: string, item: NavItem) {
  if (isSubActive(pathname, item.href)) return true
  return item.items?.some((sub) => isSubActive(pathname, sub.href)) ?? false
}

function NavItemBadge({
  item,
  messagesUnreadCount,
  roomsUnreadCount,
  feedbackNewCount,
  className,
}: {
  item: NavItem
  messagesUnreadCount: number
  roomsUnreadCount: number
  feedbackNewCount: number
  className?: string
}) {
  if (item.liveBadge === "messages" && messagesUnreadCount > 0) {
    return (
      <SidebarMenuBadge className={className}>
        {messagesUnreadCount}
      </SidebarMenuBadge>
    )
  }
  if (item.liveBadge === "rooms" && roomsUnreadCount > 0) {
    return (
      <SidebarMenuBadge className={className}>{roomsUnreadCount}</SidebarMenuBadge>
    )
  }
  if (item.liveBadge === "feedback" && feedbackNewCount > 0) {
    return (
      <SidebarMenuBadge className={className}>{feedbackNewCount}</SidebarMenuBadge>
    )
  }
  if (item.badge) {
    return (
      <SidebarMenuBadge className={className}>{item.badge}</SidebarMenuBadge>
    )
  }
  return null
}

function CollapsibleNavItem({
  item,
  pathname,
  messagesUnreadCount,
  roomsUnreadCount,
  feedbackNewCount,
}: {
  item: NavItem
  pathname: string
  messagesUnreadCount: number
  roomsUnreadCount: number
  feedbackNewCount: number
}) {
  const sectionActive = isSectionActive(pathname, item)
  const [open, setOpen] = React.useState(sectionActive)

  React.useEffect(() => {
    if (sectionActive) setOpen(true)
  }, [sectionActive])

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <SidebarMenuItem>
        <SidebarMenuButton
          isActive={isSubActive(pathname, item.href)}
          tooltip={item.title}
          render={<Link href={item.href} />}
        >
          <item.icon className="text-sidebar-foreground/70" />
          <span>{item.title}</span>
        </SidebarMenuButton>
        <div className="absolute top-1.5 right-1 flex items-center gap-1 group-data-[collapsible=icon]:hidden peer-data-[size=default]/menu-button:top-2 peer-data-[size=lg]/menu-button:top-2.5 peer-data-[size=sm]/menu-button:top-1">
          <NavItemBadge
            item={item}
            messagesUnreadCount={messagesUnreadCount}
            roomsUnreadCount={roomsUnreadCount}
            feedbackNewCount={feedbackNewCount}
            className="static"
          />
          <CollapsibleTrigger
            render={
              <SidebarMenuAction
                aria-label={`Toggle ${item.title} submenu`}
                className="relative top-auto right-auto after:hidden"
              >
                <ChevronRight
                  className={cn(
                    "transition-transform",
                    open && "rotate-90",
                  )}
                />
              </SidebarMenuAction>
            }
          />
        </div>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.items?.map((sub) => (
              <SidebarMenuSubItem key={sub.href}>
                <SidebarMenuSubButton
                  isActive={isSubActive(pathname, sub.href)}
                  render={<Link href={sub.href} />}
                >
                  <span>{sub.title}</span>
                </SidebarMenuSubButton>
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  )
}

function FlatNavItem({
  item,
  pathname,
  messagesUnreadCount,
  roomsUnreadCount,
  feedbackNewCount,
}: {
  item: NavItem
  pathname: string
  messagesUnreadCount: number
  roomsUnreadCount: number
  feedbackNewCount: number
}) {
  const active = isSubActive(pathname, item.href)

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={active}
        tooltip={item.title}
        render={<Link href={item.href} />}
      >
        <item.icon className="text-sidebar-foreground/70" />
        <span>{item.title}</span>
        {item.live ? (
          <span className="ml-auto flex items-center gap-1.5 group-data-[collapsible=icon]:hidden">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-success" />
            </span>
          </span>
        ) : null}
      </SidebarMenuButton>
      <NavItemBadge
        item={item}
        messagesUnreadCount={messagesUnreadCount}
        roomsUnreadCount={roomsUnreadCount}
        feedbackNewCount={feedbackNewCount}
      />
    </SidebarMenuItem>
  )
}

export function AppSidebar({
  showAdminNav,
  canPostJobs,
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  showAdminNav: boolean
  canPostJobs: boolean
  user: NavUserData
}) {
  const pathname = usePathname()
  const { isMobile, setOpenMobile } = useSidebar()
  const { unreadCount: messagesUnreadCount } = useUnreadCount()
  const { unreadCount: roomsUnreadCount } = useRoomsUnreadCount()
  const { newCount: feedbackNewCount } = useFeedbackNewCount(showAdminNav)

  React.useEffect(() => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }, [pathname, isMobile, setOpenMobile])

  const effectiveMainNav = mainNav.map((item) => {
    if (item.href === "/jobs" && !canPostJobs) {
      return {
        ...item,
        items: item.items?.filter((sub) => sub.href !== "/my-jobs/created"),
      }
    }
    return item
  })

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Link
          href="/now"
          className="flex items-center gap-2.5 rounded-md px-1 py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
        >
          <div
            aria-hidden
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-neutral-950 group-data-[collapsible=icon]:size-8"
          >
            <img
              src="/awn-logo-mark.svg"
              alt=""
              className="h-5 w-auto max-w-[calc(100%-0.5rem)] object-contain group-data-[collapsible=icon]:h-4"
            />
          </div>
          <div className="group-data-[collapsible=icon]:hidden">
            <span className="font-heading text-base font-semibold tracking-tight">
              A Wright Network
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <div className="border-y border-sidebar-border px-2 py-2 md:hidden">
        <NavUser user={user} variant="sidebar" />
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {effectiveMainNav.map((item) =>
                item.items && item.items.length > 0 ? (
                  <CollapsibleNavItem
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    messagesUnreadCount={messagesUnreadCount}
                    roomsUnreadCount={roomsUnreadCount}
                    feedbackNewCount={feedbackNewCount}
                  />
                ) : (
                  <FlatNavItem
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    messagesUnreadCount={messagesUnreadCount}
                    roomsUnreadCount={roomsUnreadCount}
                    feedbackNewCount={feedbackNewCount}
                  />
                ),
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {showAdminNav ? (
          <SidebarGroup>
            <SidebarGroupLabel>Admin</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNav.map((item) =>
                  item.items && item.items.length > 0 ? (
                    <CollapsibleNavItem
                      key={item.href}
                      item={item}
                      pathname={pathname}
                      messagesUnreadCount={messagesUnreadCount}
                      roomsUnreadCount={roomsUnreadCount}
                      feedbackNewCount={feedbackNewCount}
                    />
                  ) : (
                    <FlatNavItem
                      key={item.href}
                      item={item}
                      pathname={pathname}
                      messagesUnreadCount={messagesUnreadCount}
                      roomsUnreadCount={roomsUnreadCount}
                      feedbackNewCount={feedbackNewCount}
                    />
                  ),
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
      </SidebarContent>
    </Sidebar>
  )
}
