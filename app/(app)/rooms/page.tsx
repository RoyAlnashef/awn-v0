import { mainNav } from "@/lib/nav"
import { RoomsView } from "@/components/rooms/rooms-view"

const item = mainNav.find((i) => i.href === "/rooms")!

export default function RoomsPage() {
  return (
    <div className="flex h-[calc(100svh-4rem)] flex-col p-4 md:p-6">
      <RoomsView title={item.title} description={item.description} />
    </div>
  )
}
