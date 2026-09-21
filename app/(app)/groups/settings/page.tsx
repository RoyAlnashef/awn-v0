import Link from "next/link"
import { redirect } from "next/navigation"
import { Suspense } from "react"

import { PageShell } from "@/components/page-shell"
import { CreateRoomDialog } from "@/components/groups/create-room-dialog"
import { GroupsSettingsTable } from "@/components/groups/groups-settings-table"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { getSessionUser } from "@/lib/auth/get-session-user"
import { mainNav } from "@/lib/nav"
import { adminListRooms } from "@/lib/rooms/actions"

const groupsNav = mainNav.find((item) => item.href === "/groups")!

export default async function GroupsSettingsPage() {
  const sessionUser = await getSessionUser()

  if (!sessionUser?.canAccessAdmin) {
    redirect("/groups")
  }

  const result = await adminListRooms()

  return (
    <PageShell
      title="Manage groups"
      breadcrumb={
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/groups" />}>
                {groupsNav.title}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Settings</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      }
      actions={<CreateRoomDialog disabled={!result.ok} />}
    >
      <Suspense fallback={null}>
        <GroupsSettingsTable
          initialRooms={result.ok ? result.rooms : []}
          loadError={result.ok ? null : result.error}
        />
      </Suspense>
    </PageShell>
  )
}
