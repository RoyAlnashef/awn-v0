"use client"

import { useState } from "react"
import { Globe, LayoutGrid, List, Monitor, Moon, Sun } from "lucide-react"

import type { BoardViewMode } from "@/lib/board-view-mode"
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

type ThemePreference = "system" | "light" | "dark"

function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { value: T; label: string; icon?: React.ComponentType<{ className?: string }> }[]
  onChange: (value: T) => void
}) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-md border border-border bg-card p-0.5">
      {options.map((option) => {
        const Icon = option.icon
        return (
          <Button
            key={option.value}
            type="button"
            size="sm"
            variant={value === option.value ? "secondary" : "ghost"}
            onClick={() => onChange(option.value)}
            aria-pressed={value === option.value}
            className="gap-1.5"
          >
            {Icon ? <Icon className="size-3.5" /> : null}
            {option.label}
          </Button>
        )
      })}
    </div>
  )
}

function BoardViewSegment({
  value,
  onChange,
}: {
  value: BoardViewMode
  onChange: (value: BoardViewMode) => void
}) {
  return (
    <div className="inline-flex items-center gap-0.5 rounded-md border border-border bg-card p-0.5">
      <Button
        type="button"
        size="icon-sm"
        variant={value === "grid" ? "secondary" : "ghost"}
        onClick={() => onChange("grid")}
        aria-pressed={value === "grid"}
        aria-label="Grid view"
      >
        <LayoutGrid />
      </Button>
      <Button
        type="button"
        size="icon-sm"
        variant={value === "list" ? "secondary" : "ghost"}
        onClick={() => onChange("list")}
        aria-pressed={value === "list"}
        aria-label="List view"
      >
        <List />
      </Button>
    </div>
  )
}

export function PreferencesSettingsSection() {
  const [theme, setTheme] = useState<ThemePreference>("system")
  const [jobsView, setJobsView] = useState<BoardViewMode>("grid")
  const [peopleView, setPeopleView] = useState<BoardViewMode>("grid")

  return (
    <div className="flex flex-col gap-8">
      <SettingsSection
        title="Display"
        description="Customize how AWN looks on your device."
      >
        <SettingsRow
          icon={Monitor}
          label="Theme"
          description="Choose light, dark, or match your system settings."
          action={
            <SegmentedControl
              value={theme}
              onChange={setTheme}
              options={[
                { value: "system", label: "System", icon: Monitor },
                { value: "light", label: "Light", icon: Sun },
                { value: "dark", label: "Dark", icon: Moon },
              ]}
            />
          }
        />
      </SettingsSection>

      <Separator />

      <SettingsSection
        title="Board defaults"
        description="Set your preferred layout for directory pages."
      >
        <SettingsRow
          icon={LayoutGrid}
          label="Jobs board default view"
          description="How the jobs directory opens by default."
          action={<BoardViewSegment value={jobsView} onChange={setJobsView} />}
        />
        <Separator />
        <SettingsRow
          icon={LayoutGrid}
          label="People board default view"
          description="How the people directory opens by default."
          action={<BoardViewSegment value={peopleView} onChange={setPeopleView} />}
        />
      </SettingsSection>

      <Separator />

      <SettingsSection
        title="Language & region"
        description="Localization preferences for dates, times, and copy."
      >
        <SettingsRow
          icon={Globe}
          label="Language"
          description="Display language for the AWN interface."
          action={
            <Select value="english" disabled>
              <SelectTrigger size="sm" className="min-w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="english">English</SelectItem>
              </SelectContent>
            </Select>
          }
        />
        <Separator />
        <SettingsRow
          icon={Globe}
          label="Time zone"
          description="Used for scheduling and digest delivery times."
          action={
            <Select value="auto" disabled>
              <SelectTrigger size="sm" className="min-w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="auto">Auto-detect</SelectItem>
              </SelectContent>
            </Select>
          }
        />
      </SettingsSection>
    </div>
  )
}
