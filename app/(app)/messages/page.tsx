import { mainNav } from "@/lib/nav"
import { MessagesView } from "@/components/messages/messages-view"

const item = mainNav.find((i) => i.href === "/messages")!

export default function MessagesPage() {
  return (
    <div className="flex h-[calc(100svh-4rem)] flex-col p-4 md:p-6">
      <MessagesView title={item.title} />
    </div>
  )
}
