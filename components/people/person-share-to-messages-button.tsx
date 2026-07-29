"use client"

import { type ReactElement } from "react"

import { ShareToMessagesFlyout } from "@/components/messages/share-to-messages-flyout"
import { personToSharePayload } from "@/lib/messages/member-share"
import type { Person } from "@/lib/people-data"

export function PersonShareToMessagesButton({
  person,
  children,
}: {
  person: Person
  children: ReactElement<{ onClick?: (event: React.MouseEvent<HTMLElement>) => void }>
}) {
  return (
    <ShareToMessagesFlyout
      shareMember={person.id}
      shareLabel={personToSharePayload(person).name}
    >
      {children}
    </ShareToMessagesFlyout>
  )
}
