import Link from "next/link"
import { redirect } from "next/navigation"

import { PageShell } from "@/components/page-shell"
import { CreateRoomDialog } from "@/components/groups/create-room-dialog"
import { RoomsTable } from "@/components/groups/rooms-table"
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

const roomsNav = mainNav.find((item) => item.href === "/rooms")!

export default async function RoomsSettingsPage() {
  const sessionUser = await getSessionUser()

  if (!sessionUser?.canAccessAdmin) {
    redirect("/rooms")
  }

  const result = await adminListRooms()

  return (
    <PageShell
      title="Manage Rooms"
      breadcrumb={
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/rooms" />}>
                {roomsNav.title}
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
      <RoomsTable
        initialRooms={result.ok ? result.rooms : []}
        loadError={result.ok ? null : result.error}
        showCreateButton={false}
      />
    </PageShell>
  )
}
