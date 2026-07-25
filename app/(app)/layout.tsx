import type { ReactNode } from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { MessagesProvider } from "@/components/messages/messages-provider"
import { PresenceHeartbeat } from "@/components/presence-heartbeat"
import { RoomsProvider } from "@/components/rooms/rooms-provider"
import { getSessionUser } from "@/lib/auth/get-session-user"

export default async function AppLayout({ children }: { children: ReactNode }) {
  const sessionUser = await getSessionUser()

  // Middleware should redirect first; this is a server-side safety net.
  if (!sessionUser) {
    redirect("/login")
  }

  const cookieStore = await cookies()
  const sidebarState = cookieStore.get("sidebar_state")?.value
  const defaultOpen = sidebarState !== "false"

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <RoomsProvider
          currentUser={{
            id: sessionUser.id,
            name: sessionUser.name,
            avatarUrl: sessionUser.avatarUrl,
          }}
        >
        <MessagesProvider
          currentUser={{
            id: sessionUser.id,
            name: sessionUser.name,
            avatarUrl: sessionUser.avatarUrl,
          }}
        >
          <PresenceHeartbeat />
          <AppSidebar showAdminNav={sessionUser.canAccessAdmin} />
          <SidebarInset>
            <SiteHeader
              user={{
                name: sessionUser.name,
                title: sessionUser.title,
                email: sessionUser.email,
                avatarUrl: sessionUser.avatarUrl,
                initials: sessionUser.initials,
              }}
            />
            {children}
          </SidebarInset>
        </MessagesProvider>
      </RoomsProvider>
    </SidebarProvider>
  )
}
