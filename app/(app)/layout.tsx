import type { ReactNode } from "react"
import { redirect } from "next/navigation"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { MessagesProvider } from "@/components/messages/messages-provider"
import { RoomsProvider } from "@/components/rooms/rooms-provider"
import { getSessionUser } from "@/lib/auth/get-session-user"

export default async function AppLayout({ children }: { children: ReactNode }) {
  const sessionUser = await getSessionUser()

  // Middleware should redirect first; this is a server-side safety net.
  if (!sessionUser) {
    redirect("/login")
  }

  return (
    <SidebarProvider>
      <RoomsProvider>
        <MessagesProvider>
          <AppSidebar />
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
