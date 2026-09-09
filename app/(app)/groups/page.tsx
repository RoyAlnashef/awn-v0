import { mainNav } from "@/lib/nav"
import { RoomsView } from "@/components/rooms/rooms-view"
import { getSessionUser } from "@/lib/auth/get-session-user"

const item = mainNav.find((i) => i.href === "/groups")!

export default async function GroupsPage({
  searchParams,
}: {
  searchParams: Promise<{
    group?: string
    room?: string
    shareJob?: string
    shareMember?: string
  }>
}) {
  const [params, sessionUser] = await Promise.all([
    searchParams,
    getSessionUser(),
  ])

  return (
    <div className="flex h-[calc(100svh-4rem)] min-w-0 flex-col overflow-x-hidden p-4 md:p-6">
      <RoomsView
        title={item.title}
        description={item.description}
        initialRoomId={params.group ?? params.room}
        initialShareJobId={params.shareJob}
        initialShareMemberId={params.shareMember}
        canManageRooms={sessionUser?.canAccessAdmin ?? false}
      />
    </div>
  )
}
