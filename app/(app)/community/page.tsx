import { PageShell } from "@/components/page-shell"
import { RoomsTable } from "@/components/groups/rooms-table"
import { adminListRooms } from "@/lib/rooms/actions"
import { adminNav } from "@/lib/nav"

const item = adminNav.find((i) => i.href === "/community")!

export default async function CommunityPage() {
  const result = await adminListRooms()

  return (
    <PageShell title={item.title} description={item.description}>
      <RoomsTable
        initialRooms={result.ok ? result.rooms : []}
        loadError={result.ok ? null : result.error}
      />
    </PageShell>
  )
}
