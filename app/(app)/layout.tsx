import type { ReactNode } from "react"
import { redirect } from "next/navigation"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { MessagesProvider } from "@/components/messages/messages-provider"
import { RoomsProvider } from "@/components/rooms/rooms-provider"
import { getSessionUser } from "@/lib/auth/get-session-user"
import { listConversations } from "@/lib/messages/actions"
import { directConversations } from "@/lib/messages-data"

export default async function AppLayout({ children }: { children: ReactNode }) {
  const sessionUser = await getSessionUser()

  // Middleware should redirect first; this is a server-side safety net.
  if (!sessionUser) {
    redirect("/login")
  }

  const conversationsResult = await listConversations()
  const initialConversations = conversationsResult.ok
    ? conversationsResult.conversations
    : directConversations

  return (
    <SidebarProvider>
      <RoomsProvider>
        <MessagesProvider
          initialConversations={initialConversations}
          currentUser={{
            id: sessionUser.id,
            name: sessionUser.name,
            avatarUrl: sessionUser.avatarUrl,
          }}
        >
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
