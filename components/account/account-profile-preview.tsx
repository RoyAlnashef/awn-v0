"use client"

import { toProfileTourCredits } from "@/lib/account-profile"
import { PersonProfileCard } from "@/components/people/person-profile-card"
import { useAccountProfile } from "@/components/account/account-profile-provider"

export function AccountProfilePreview() {
  const { draft, tourCredits } = useAccountProfile()

  return (
    <div className="sticky top-6 flex h-[calc(100vh-8rem)] max-h-[calc(100vh-8rem)] flex-col">
      <p className="mb-2 shrink-0 text-xs font-semibold tracking-widest text-muted-foreground uppercase">
        Preview
      </p>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-popover">
        <PersonProfileCard
          person={draft}
          tourCredits={toProfileTourCredits(tourCredits)}
          mode="preview"
          className="h-full min-h-0"
        />
      </div>
    </div>
  )
}
