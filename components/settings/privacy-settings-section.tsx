"use client"

import { useState } from "react"
import { Ban, ChevronRight, Eye, FileText, Search, UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { SettingsRow } from "@/components/settings/settings-row"
import { SettingsSection } from "@/components/settings/settings-section"
import { SettingsToggleRow } from "@/components/settings/settings-toggle-row"

export function PrivacySettingsSection() {
  const [resumeAccess, setResumeAccess] = useState("everyone")
  const [connectionRequests, setConnectionRequests] = useState("everyone")

  return (
    <div className="flex flex-col gap-8">
      <SettingsSection
        title="Discoverability"
        description="Control how others find and view your presence on AWN."
      >
        <SettingsToggleRow
          icon={Search}
          label="Show in People directory"
          description="Allow others to find you in search and browse results."
          ariaLabel="Show in People directory"
        />
        <Separator />
        <SettingsToggleRow
          icon={Eye}
          label="Show availability on profile"
          description="Display your availability badge on your public profile."
          ariaLabel="Show availability on profile"
        />
      </SettingsSection>

      <Separator />

      <SettingsSection
        title="Profile access"
        description="Manage who can view sensitive profile information."
      >
        <SettingsRow
          icon={FileText}
          label="Who can view your resume"
          description="Control access to your uploaded CV."
          action={
            <Select
              value={resumeAccess}
              onValueChange={(value) => {
                if (value) setResumeAccess(value)
              }}
            >
              <SelectTrigger size="sm" className="min-w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="everyone">Everyone</SelectItem>
                <SelectItem value="connections">Connections</SelectItem>
                <SelectItem value="nobody">Nobody</SelectItem>
              </SelectContent>
            </Select>
          }
        />
        <Separator />
        <SettingsRow
          icon={UserPlus}
          label="Who can send connection requests"
          description="Limit who can request to connect with you."
          action={
            <Select
              value={connectionRequests}
              onValueChange={(value) => {
                if (value) setConnectionRequests(value)
              }}
            >
              <SelectTrigger size="sm" className="min-w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="everyone">Everyone</SelectItem>
                <SelectItem value="nobody">Nobody</SelectItem>
              </SelectContent>
            </Select>
          }
        />
      </SettingsSection>

      <Separator />

      <SettingsSection
        title="Blocked members"
        description="Manage members you've blocked from contacting you."
      >
        <SettingsRow
          icon={Ban}
          label="Blocked accounts"
          description="No blocked members"
          action={
            <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
              Manage
              <ChevronRight className="size-3.5" />
            </Button>
          }
        />
      </SettingsSection>
    </div>
  )
}
