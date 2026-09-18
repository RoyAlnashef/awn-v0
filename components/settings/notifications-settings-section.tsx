"use client"

import {
  AtSign,
  Bell,
  Briefcase,
  Eye,
  Handshake,
  Mail,
  MessageSquare,
  Reply,
  Smartphone,
  Sparkles,
  Star,
  Sun,
} from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SettingsSection } from "@/components/settings/settings-section"
import { SettingsToggleRow } from "@/components/settings/settings-toggle-row"
import { ComingSoonBadge } from "@/components/settings/coming-soon-badge"
import { SettingsRow } from "@/components/settings/settings-row"

export function NotificationsSettingsSection() {
  return (
    <div className="flex flex-col gap-8">
      <SettingsSection
        title="Messages"
        description="Alerts for direct messages and group conversations."
      >
        <Alert className="mb-2">
          <AlertDescription className="text-xs text-muted-foreground">
            To mute a specific room, use the room menu in Messages.
          </AlertDescription>
        </Alert>
        <SettingsToggleRow
          icon={MessageSquare}
          label="Direct messages"
          description="When someone sends you a private message."
          ariaLabel="Direct message notifications"
        />
        <Separator />
        <SettingsToggleRow
          icon={AtSign}
          label="Group mentions"
          description="When someone @mentions you in a room."
          ariaLabel="Group mention notifications"
        />
        <Separator />
        <SettingsToggleRow
          icon={Reply}
          label="Group replies"
          description="When someone replies to your message in a room."
          ariaLabel="Group reply notifications"
        />
      </SettingsSection>

      <Separator />

      <SettingsSection
        title="Jobs & opportunities"
        description="Stay informed about roles and urgent crew callouts."
      >
        <SettingsToggleRow
          icon={Briefcase}
          label="Application updates"
          description="When your job application status changes."
          ariaLabel="Application update notifications"
        />
        <Separator />
        <SettingsToggleRow
          icon={Sparkles}
          label="Saved job alerts"
          description="When new jobs match your saved searches."
          comingSoon
          defaultChecked={false}
          ariaLabel="Saved job alert notifications"
        />
        <Separator />
        <SettingsToggleRow
          icon={Bell}
          label="Help Now callouts"
          description="Urgent 48-hour crew needs in your department."
          comingSoon
          defaultChecked={false}
          ariaLabel="Help Now notifications"
        />
      </SettingsSection>

      <Separator />

      <SettingsSection
        title="Profile & network"
        description="Updates about your profile and professional connections."
      >
        <SettingsToggleRow
          icon={Eye}
          label="Profile views"
          description="When someone views your profile."
          comingSoon
          defaultChecked={false}
          ariaLabel="Profile view notifications"
        />
        <Separator />
        <SettingsToggleRow
          icon={Star}
          label="Tour credit vouches"
          description="When a colleague vouches for one of your tour credits."
          ariaLabel="Tour credit vouch notifications"
        />
        <Separator />
        <SettingsToggleRow
          icon={Handshake}
          label="Connection requests"
          description="When someone wants to connect with you."
          comingSoon
          defaultChecked={false}
          ariaLabel="Connection request notifications"
        />
      </SettingsSection>

      <Separator />

      <SettingsSection
        title="Digests"
        description="Periodic summaries delivered to your inbox or notification center."
      >
        <SettingsToggleRow
          icon={Sun}
          label="Morning brief"
          description="A daily snapshot of jobs, messages, and network activity."
          comingSoon
          defaultChecked={false}
          ariaLabel="Morning brief notifications"
        />
        <Separator />
        <SettingsToggleRow
          icon={Mail}
          label="Weekly email digest"
          description="A weekly summary of activity you may have missed."
          comingSoon
          defaultChecked={false}
          ariaLabel="Weekly email digest"
        />
      </SettingsSection>

      <Separator />

      <SettingsSection
        title="Delivery channels"
        description="Choose how notifications reach you across devices."
      >
        <SettingsToggleRow
          icon={Bell}
          label="In-app notifications"
          description="Show alerts in the notification center."
          ariaLabel="In-app notifications"
        />
        <Separator />
        <SettingsToggleRow
          icon={Mail}
          label="Email notifications"
          description="Send important alerts to your email address."
          ariaLabel="Email notifications"
        />
        <Separator />
        <SettingsRow
          icon={Smartphone}
          label="Push notifications"
          description="Receive alerts on this device even when AWN is closed."
          badge={<ComingSoonBadge />}
          action={
            <Button variant="outline" size="sm" disabled>
              Enable push
            </Button>
          }
        />
      </SettingsSection>
    </div>
  )
}
