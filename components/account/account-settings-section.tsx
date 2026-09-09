"use client"

import { ChevronRight, KeyRound, Mail, ShieldCheck, Smartphone, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

function SettingsRow({
  icon: Icon,
  label,
  description,
  value,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  description?: string
  value?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">{label}</span>
          {description && (
            <span className="text-xs text-muted-foreground">{description}</span>
          )}
          {value && (
            <span className="text-xs text-foreground/70">{value}</span>
          )}
        </div>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  )
}

export function AccountSettingsSection() {
  return (
    <div className="flex flex-col gap-8">
      {/* Account */}
      <section className="flex flex-col gap-1">
        <div className="flex flex-col gap-0.5 pb-2">
          <h3 className="font-heading text-base font-semibold">Account</h3>
          <p className="text-sm text-muted-foreground">
            Manage your login credentials and contact details.
          </p>
        </div>

        <SettingsRow
          icon={Mail}
          label="Email address"
          description="Used for login and notifications."
          value="jordan@reyestouring.com"
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
      </section>

      <Separator />

      {/* Security */}
      <section className="flex flex-col gap-1">
        <div className="flex flex-col gap-0.5 pb-2">
          <h3 className="font-heading text-base font-semibold">Security</h3>
          <p className="text-sm text-muted-foreground">
            Protect your account with additional verification.
          </p>
        </div>

        <SettingsRow
          icon={Smartphone}
          label="Two-factor authentication"
          description="Add an extra layer of security to your login."
          action={<Switch defaultChecked={false} aria-label="Enable 2FA" />}
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
      </section>

      <Separator />

      {/* Danger zone */}
      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <h3 className="font-heading text-base font-semibold text-destructive">
            Danger Zone
          </h3>
          <p className="text-sm text-muted-foreground">
            Irreversible account actions. Proceed with caution.
          </p>
        </div>

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
      </section>
    </div>
  )
}
