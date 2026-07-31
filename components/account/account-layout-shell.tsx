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
        fillViewport
      >
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="flex min-h-0 flex-col gap-4 overflow-auto lg:col-span-8">
            <AccountNav />
            <div className="min-w-0 rounded-xl border border-border bg-background p-6">
              {children}
            </div>
          </div>
          <aside className="hidden min-h-0 lg:col-span-4 lg:flex lg:flex-col lg:p-4 xl:p-6 rounded-4xl">
            <AccountProfilePreview />
          </aside>
        </div>
      </PageShell>
    </AccountProfileProvider>
  )
}
