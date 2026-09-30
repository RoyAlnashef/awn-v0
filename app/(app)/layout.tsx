import type { ReactNode } from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { MessagesProvider } from "@/components/messages/messages-provider"
import { PushProvider } from "@/components/push/push-provider"
import { PresenceHeartbeat } from "@/components/presence-heartbeat"
import { RoomsProvider } from "@/components/rooms/rooms-provider"
import { LegalAcceptanceGate } from "@/components/legal/legal-acceptance-gate"
import { getSessionUser } from "@/lib/auth/get-session-user"
import { getOutstandingLegalDocuments } from "@/lib/legal/acceptance"

export default async function AppLayout({ children }: { children: ReactNode }) {
  const sessionUser = await getSessionUser()

  // Middleware should redirect first; this is a server-side safety net.
  if (!sessionUser) {
    redirect("/login")
  }

  if (!sessionUser.isApproved) {
    redirect("/pending")
  }

  const [cookieStore, outstandingLegal] = await Promise.all([
    cookies(),
    getOutstandingLegalDocuments(),
  ])
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
          <PushProvider>
          <PresenceHeartbeat />
          <AppSidebar
            showAdminNav={sessionUser.canAccessAdmin}
            canPostJobs={sessionUser.canPostJobs}
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
          {outstandingLegal.length > 0 && (
            <LegalAcceptanceGate
              outstanding={outstandingLegal.map((entry) => ({
                key: entry.key,
                title: entry.document.title,
                document: entry.document,
              }))}
            />
          )}
          </PushProvider>
        </MessagesProvider>
      </RoomsProvider>
    </SidebarProvider>
  )
}
