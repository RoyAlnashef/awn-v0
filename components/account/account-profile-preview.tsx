"use client"

import { toProfileTourCredits } from "@/lib/account-profile"
import { PersonProfileCard } from "@/components/people/person-profile-card"
import { useAccountProfile } from "@/components/account/account-profile-provider"

export function AccountProfilePreview() {
  const { draft, tourCredits, online } = useAccountProfile()

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <p className="mb-4 shrink-0 text-xs font-semibold tracking-widest text-center text-muted-foreground/40 uppercase">
        Preview Only
      </p>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card">
        <PersonProfileCard
          person={draft}
          tourCredits={toProfileTourCredits(tourCredits)}
          mode="preview"
          online={online}
          className="h-full min-h-0"
        />
      </div>
    </div>
  )
}
