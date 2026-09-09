"use client"

import { type ReactElement } from "react"

import { ShareToRoomsFlyout } from "@/components/rooms/share-to-rooms-flyout"
import { personToSharePayload } from "@/lib/messages/member-share"
import type { Person } from "@/lib/people-data"

export function PersonShareToRoomsButton({
  person,
  children,
}: {
  person: Person
  children: ReactElement<{ onClick?: (event: React.MouseEvent<HTMLElement>) => void }>
}) {
  return (
    <ShareToRoomsFlyout
      shareMember={person.id}
      shareLabel={personToSharePayload(person).name}
    >
      {children}
    </ShareToRoomsFlyout>
  )
}
