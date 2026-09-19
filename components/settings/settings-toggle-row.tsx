"use client"

import type { ReactNode } from "react"

import { Switch } from "@/components/ui/switch"
import { SettingsRow } from "@/components/settings/settings-row"
import { ComingSoonBadge } from "@/components/settings/coming-soon-badge"

export function SettingsToggleRow({
  icon,
  label,
  description,
  defaultChecked = true,
  disabled = false,
  comingSoon = false,
  ariaLabel,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  description: string
  defaultChecked?: boolean
  disabled?: boolean
  comingSoon?: boolean
  ariaLabel: string
}) {
  const badge: ReactNode = comingSoon ? <ComingSoonBadge /> : undefined

  return (
    <SettingsRow
      icon={icon}
      label={label}
      description={description}
      badge={badge}
      action={
        <Switch
          defaultChecked={defaultChecked}
          disabled={disabled || comingSoon}
          aria-label={ariaLabel}
        />
      }
    />
  )
}
