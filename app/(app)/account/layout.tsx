import type { ReactNode } from "react"

import { PageShell } from "@/components/page-shell"
import { AccountNav } from "@/components/account/account-nav"

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <PageShell title="My Account" description="Manage your profile, credits, and preferences.">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[200px_1fr]">
        <AccountNav />
        <div className="min-w-0 sm:w-full lg:max-w-3/4 rounded-xl border border-border bg-background p-6">{children}</div>
      </div>
    </PageShell>
  )
}
