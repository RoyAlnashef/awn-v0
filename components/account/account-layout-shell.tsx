"use client"

import type { ReactNode } from "react"

import type { AccountTourCredit } from "@/lib/account-profile"
import type { Person } from "@/lib/people-data"
import { PageShell } from "@/components/page-shell"
import { AccountNav } from "@/components/account/account-nav"
import { AccountPageActions } from "@/components/account/account-page-actions"
import { AccountProfilePreview } from "@/components/account/account-profile-preview"
import { AccountProfileProvider } from "@/components/account/account-profile-provider"

export function AccountLayoutShell({
  children,
  initialProfile,
  initialTourCredits,
  userId,
  initialOnline,
}: {
  children: ReactNode
  initialProfile: Person
  initialTourCredits: AccountTourCredit[]
  userId: string
  initialOnline: boolean
}) {
  return (
    <AccountProfileProvider
      initialProfile={initialProfile}
      initialTourCredits={initialTourCredits}
      userId={userId}
      initialOnline={initialOnline}
    >
      <PageShell
        title="My account"
        description="Manage your profile, credits, and preferences."
        actions={<AccountPageActions />}
        fillViewport
      >
        <div className="grid min-h-0 flex-1 grid-cols-1 lg:gap-8 xl:gap-12 lg:grid-cols-12">
          <div className="flex min-h-0 flex-col gap-4 overflow-auto lg:col-span-7">
            <AccountNav />
            <div className="min-w-0 rounded-xl border border-border bg-background p-6">
              {children}
            </div>
          </div>
          <aside className="hidden min-h-0 lg:col-span-5 lg:flex lg:flex-col lg:p-5 xl:px-12 xl:pb-12 xl:pt-4 bg-card/20 rounded-4xl">
            <AccountProfilePreview />
          </aside>
        </div>
      </PageShell>
    </AccountProfileProvider>
  )
}
