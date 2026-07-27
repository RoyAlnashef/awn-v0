import { mainNav } from "@/lib/nav"
import { RoomsView } from "@/components/rooms/rooms-view"

const item = mainNav.find((i) => i.href === "/rooms")!

export default async function PopoutRoomsPage({
  searchParams,
}: {
  searchParams: Promise<{ room?: string }>
}) {
  const params = await searchParams

  return (
    <div className="flex h-[calc(100svh-4rem)] flex-col p-4">
      <RoomsView
        title={item.title}
        description={item.description}
        initialRoomId={params.room}
        popout
      />
    </div>
  )
}
