"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { AvailabilityCard } from "@/components/availability-card"
import { useUnreadCount } from "@/lib/messages/hooks/use-unread-count"
import { mainNav, adminNav, type NavItem } from "@/lib/nav"

export function AppSidebar({
  showAdminNav,
  ...props
}: React.ComponentProps<typeof Sidebar> & { showAdminNav: boolean }) {
  const pathname = usePathname()
  const { unreadCount: messagesUnreadCount } = useUnreadCount()

  const isActive = (item: NavItem) =>
    pathname === item.href || pathname.startsWith(`${item.href}/`)

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
              {mainNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={isActive(item)}
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
                  {item.liveBadge === "messages" && messagesUnreadCount > 0 ? (
                    <SidebarMenuBadge>{messagesUnreadCount}</SidebarMenuBadge>
                  ) : item.badge ? (
                    <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                  ) : null}
                </SidebarMenuItem>
              ))}
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
