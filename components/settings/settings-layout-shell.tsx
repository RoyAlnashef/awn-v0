"use client"

import type { ReactNode } from "react"

import { PageShell } from "@/components/page-shell"
import { SettingsNav } from "@/components/settings/settings-nav"

export function SettingsLayoutShell({ children }: { children: ReactNode }) {
  return (
    <PageShell
      title="Settings"
      description="Manage your account, notifications, and preferences."
    >
      <div className="flex flex-col gap-4">
        <SettingsNav />
        <div className="rounded-xl border border-border bg-background p-6">
          {children}
        </div>
      </div>
    </PageShell>
  )
}
