"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

import { memberNodeStyle, type ProximityMember } from "./proximity-data"

const toneClass: Record<ProximityMember["statusTone"], string> = {
  success: "text-success",
  warning: "text-notification",
  muted: "text-muted-foreground",
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{children}</span>
    </div>
  )
}

export function MemberDetail({ member }: { member: ProximityMember }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <span
          className="flex size-11 shrink-0 items-center justify-center rounded-full border font-mono text-sm font-semibold"
          style={memberNodeStyle(member.color, true)}
        >
          {member.initials}
        </span>
        <div className="flex flex-col">
          <span className="font-heading text-base font-semibold leading-tight">
            {member.name}
          </span>
          <span className="text-sm text-muted-foreground">{member.role}</span>
        </div>
      </div>

      <div className="flex flex-col gap-2.5">
        <DetailRow label="Location">{member.location}</DetailRow>
        <DetailRow label="Distance">{member.distance} mi</DetailRow>
        <DetailRow label="Status">
          <span className={cn(toneClass[member.statusTone])}>{member.status}</span>
        </DetailRow>
        <DetailRow label="Checked in">{member.checkedIn}</DetailRow>
      </div>

      <div className="flex items-center gap-2">
        <Button size="sm" className="flex-1">
          Message
        </Button>
        <Button size="sm" variant="outline" className="flex-1">
          Wave
        </Button>
      </div>
    </div>
  )
}
