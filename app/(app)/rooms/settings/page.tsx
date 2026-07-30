import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"

import { PageShell } from "@/components/page-shell"
import { RoomsTable } from "@/components/groups/rooms-table"
import { Button } from "@/components/ui/button"
import { getSessionUser } from "@/lib/auth/get-session-user"
import { adminListRooms } from "@/lib/rooms/actions"

export default async function RoomsSettingsPage() {
  const sessionUser = await getSessionUser()

  if (!sessionUser?.canAccessAdmin) {
    redirect("/rooms")
  }

  const result = await adminListRooms()

  return (
    <PageShell
      title="Manage Rooms"
      description="Manage crew rooms, departments, and community channels."
      actions={
        <Button variant="outline" size="sm" render={<Link href="/rooms" />}>
          <ArrowLeft className="size-4" />
          Back to Rooms
        </Button>
      }
    >
      <RoomsTable
        initialRooms={result.ok ? result.rooms : []}
        loadError={result.ok ? null : result.error}
      />
    </PageShell>
  )
}
