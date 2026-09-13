import { Suspense } from "react"

import { mainNav } from "@/lib/nav"
import { MessagesView } from "@/components/messages/messages-view"

const item = mainNav.find((i) => i.href === "/messages")!

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{
    conversation?: string
    person?: string
    draft?: string
    shareJob?: string
    shareMember?: string
    shareLabel?: string
    newMessage?: string
  }>
}) {
  const params = await searchParams

  return (
    <div className="mx-auto flex w-full max-w-[1400px] min-w-0 flex-1 flex-col overflow-x-hidden px-4 py-8 md:px-6 lg:h-[calc(100svh-4rem)] lg:min-h-0">
      <Suspense fallback={null}>
        <MessagesView
          title={item.title}
          initialConversationId={params.conversation}
          initialPersonId={params.person}
          initialDraft={params.draft}
          initialShareJobId={params.shareJob}
          initialShareMemberId={params.shareMember}
          initialShareLabel={params.shareLabel}
          initialNewMessage={params.newMessage === "1"}
        />
      </Suspense>
    </div>
  )
}
