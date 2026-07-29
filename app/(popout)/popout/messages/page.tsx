import { Suspense } from "react"

import { mainNav } from "@/lib/nav"
import { MessagesView } from "@/components/messages/messages-view"

const item = mainNav.find((i) => i.href === "/messages")!

export default async function PopoutMessagesPage({
  searchParams,
}: {
  searchParams: Promise<{
    conversation?: string
    person?: string
    draft?: string
    shareJob?: string
    shareMember?: string
  }>
}) {
  const params = await searchParams

  return (
    <div className="flex h-[calc(100svh-4rem)] flex-col p-4">
      <Suspense fallback={null}>
        <MessagesView
          title={item.title}
          initialConversationId={params.conversation}
          initialPersonId={params.person}
          initialDraft={params.draft}
          initialShareJobId={params.shareJob}
          initialShareMemberId={params.shareMember}
          popout
          basePath="/popout/messages"
        />
      </Suspense>
    </div>
  )
}
