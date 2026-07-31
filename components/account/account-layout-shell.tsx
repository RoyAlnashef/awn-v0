"use client"

import type { ReactNode } from "react"

import { PageShell } from "@/components/page-shell"
import { AccountNav } from "@/components/account/account-nav"
import { AccountPageActions } from "@/components/account/account-page-actions"
import { AccountProfilePreview } from "@/components/account/account-profile-preview"
import { AccountProfileProvider } from "@/components/account/account-profile-provider"

export function AccountLayoutShell({ children }: { children: ReactNode }) {
  return (
    <AccountProfileProvider>
      <PageShell
        title="My Account"
        description="Manage your profile, credits, and preferences."
        actions={<AccountPageActions />}
      >
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="flex flex-col gap-4 lg:col-span-8">
            <AccountNav />
            <div className="min-w-0 rounded-xl border border-border bg-background p-6">
              {children}
            </div>
          </div>
          <aside className="hidden lg:col-span-4 lg:block">
            <AccountProfilePreview />
          </aside>
        </div>
      </PageShell>
    </AccountProfileProvider>
  )
}
