"use client"

import { Search } from "lucide-react"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { NavUser, type NavUserData } from "@/components/nav-user"
import { Messages } from "@/components/messages"
import { Notifications } from "@/components/notifications"
import { Rooms } from "@/components/rooms"

export function SiteHeader({ user }: { user: NavUserData }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b bg-background/80 px-4 backdrop-blur-sm">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-1 my-auto h-6" />

      <div className="relative max-w-md flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search crew, jobs, venues…"
          className="pl-9"
        />
      </div>

      <div className="ml-auto flex items-center gap-1 sm:gap-2">
        <Rooms />
        <Messages />
        <Notifications />
        <Separator
          orientation="vertical"
          className="mx-1 my-auto hidden h-6 sm:block"
        />
        <NavUser user={user} />
      </div>
    </header>
  )
}
