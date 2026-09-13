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
    <div className="flex flex-1 flex-col p-4 lg:h-[calc(100svh-4rem)] lg:min-h-0">
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
