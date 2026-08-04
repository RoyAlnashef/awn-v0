"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
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
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { AvailabilityCard } from "@/components/availability-card"
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
  className,
}: {
  item: NavItem
  messagesUnreadCount: number
  roomsUnreadCount: number
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
}: {
  item: NavItem
  pathname: string
  messagesUnreadCount: number
  roomsUnreadCount: number
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
            className="static h-auto min-w-0 px-0"
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
}: {
  item: NavItem
  pathname: string
  messagesUnreadCount: number
  roomsUnreadCount: number
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
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-primary" />
            </span>
          </span>
        ) : null}
      </SidebarMenuButton>
      <NavItemBadge
        item={item}
        messagesUnreadCount={messagesUnreadCount}
        roomsUnreadCount={roomsUnreadCount}
      />
    </SidebarMenuItem>
  )
}

export function AppSidebar({
  showAdminNav,
  ...props
}: React.ComponentProps<typeof Sidebar> & { showAdminNav: boolean }) {
  const pathname = usePathname()
  const { unreadCount: messagesUnreadCount } = useUnreadCount()
  const { unreadCount: roomsUnreadCount } = useRoomsUnreadCount()

  const isActive = (item: NavItem) => isSubActive(pathname, item.href)

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <Link
          href="/now"
          className="flex items-center gap-2.5 rounded-md px-1 py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0"
        >
          <Image
            src="/android-chrome-192x192.png"
            alt="A Wright Network"
            width={36}
            height={36}
            className="size-9 shrink-0 rounded-lg group-data-[collapsible=icon]:size-8"
            priority
          />
          <div className="flex flex-col leading-tight group-data-[collapsible=icon]:hidden">
            <span className="font-heading text-base font-semibold tracking-tight">
              A Wright Network
            </span>
            <span className="text-xs text-sidebar-foreground/60">
              Touring crew, connected
            </span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNav.map((item) =>
                item.items && item.items.length > 0 ? (
                  <CollapsibleNavItem
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    messagesUnreadCount={messagesUnreadCount}
                    roomsUnreadCount={roomsUnreadCount}
                  />
                ) : (
                  <FlatNavItem
                    key={item.href}
                    item={item}
                    pathname={pathname}
                    messagesUnreadCount={messagesUnreadCount}
                    roomsUnreadCount={roomsUnreadCount}
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
                {adminNav.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActive(item)}
                      tooltip={item.title}
                      render={<Link href={item.href} />}
                    >
                      <item.icon className="text-sidebar-foreground/70" />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                    {item.badge ? (
                      <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                    ) : null}
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ) : null}
      </SidebarContent>

      <SidebarFooter>
        <AvailabilityCard />
      </SidebarFooter>
    </Sidebar>
  )
}
