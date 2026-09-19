import type { ReactNode } from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { MessagesProvider } from "@/components/messages/messages-provider"
import { RoomsProvider } from "@/components/rooms/rooms-provider"
import { getSessionUser } from "@/lib/auth/get-session-user"

export default async function PopoutLayout({
  children,
}: {
  children: ReactNode
}) {
  const sessionUser = await getSessionUser()

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
          <AppSidebar
            showAdminNav={sessionUser.canAccessAdmin}
            user={{
              name: sessionUser.name,
              title: sessionUser.title,
              email: sessionUser.email,
              avatarUrl: sessionUser.avatarUrl,
              initials: sessionUser.initials,
              handle: sessionUser.handle,
              appearOffline: sessionUser.appearOffline,
              availableForWork: sessionUser.availableForWork,
              online: sessionUser.online,
            }}
          />
          <SidebarInset>
            <SiteHeader
              user={{
                name: sessionUser.name,
                title: sessionUser.title,
                email: sessionUser.email,
                avatarUrl: sessionUser.avatarUrl,
                initials: sessionUser.initials,
                handle: sessionUser.handle,
                appearOffline: sessionUser.appearOffline,
                availableForWork: sessionUser.availableForWork,
                online: sessionUser.online,
              }}
            />
            {children}
          </SidebarInset>
        </MessagesProvider>
      </RoomsProvider>
    </SidebarProvider>
  )
}
