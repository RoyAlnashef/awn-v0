"use client"

import { ChevronRight, KeyRound, Mail, ShieldCheck, Smartphone, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { SettingsRow } from "@/components/settings/settings-row"
import { SettingsSection } from "@/components/settings/settings-section"

export function AccountSettingsSection({ email }: { email?: string }) {
  return (
    <div className="flex flex-col gap-8">
      <SettingsSection
        title="Account"
        description="Manage your login credentials and contact details."
      >
        <SettingsRow
          icon={Mail}
          label="Email address"
          description="Used for login and notifications."
          value={email ?? "—"}
          action={
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
              Change
              <ChevronRight className="size-3.5" />
            </Button>
          }
        />
        <Separator />
        <SettingsRow
          icon={KeyRound}
          label="Password"
          description="Last updated 6 months ago."
          action={
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
              Change
              <ChevronRight className="size-3.5" />
            </Button>
          }
        />
      </SettingsSection>

      <Separator />

      <SettingsSection
        title="Security"
        description="Protect your account with additional verification."
      >
        <SettingsRow
          icon={Smartphone}
          label="Two-factor authentication"
          description="Add an extra layer of security to your login."
          action={<Switch defaultChecked={false} aria-label="Enable two-factor authentication" />}
        />
        <Separator />
        <SettingsRow
          icon={ShieldCheck}
          label="Active sessions"
          description="Review devices currently signed in to your account."
          action={
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
              View
              <ChevronRight className="size-3.5" />
            </Button>
          }
        />
      </SettingsSection>

      <Separator />

      <SettingsSection
        title="Danger Zone"
        description="Irreversible account actions. Proceed with caution."
        titleClassName="text-destructive"
      >
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">Delete account</span>
              <span className="text-xs text-muted-foreground">
                Permanently remove your profile, credits, and all data. This cannot be undone.
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 gap-1.5 border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <Trash2 className="size-3.5" />
              Delete
            </Button>
          </div>
        </div>
      </SettingsSection>
    </div>
  )
}
