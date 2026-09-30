import { mainNav } from "@/lib/nav"
import { RoomsView } from "@/components/rooms/rooms-view"

const item = mainNav.find((i) => i.href === "/groups")!

export default async function PopoutGroupsPage({
  searchParams,
}: {
  searchParams: Promise<{
    group?: string
    room?: string
    shareJob?: string
    shareMember?: string
  }>
}) {
  const params = await searchParams

  return (
    <div className="app-viewport-below-header flex flex-col overflow-hidden p-4">
      <RoomsView
        title={item.title}
        description={item.description}
        initialRoomId={params.group ?? params.room}
        initialShareJobId={params.shareJob}
        initialShareMemberId={params.shareMember}
        popout
      />
    </div>
  )
}
