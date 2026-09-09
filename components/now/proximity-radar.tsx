"use client"

import { cn } from "@/lib/utils"

import {
  memberNodeStyle,
  proximityRings,
  type ProximityMember,
} from "./proximity-data"

export function ProximityRadar({
  members,
  selectedId,
  onSelect,
}: {
  members: ProximityMember[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[520px]">
      {proximityRings.map((ring) => {
        const inset = (100 - ring.size) / 2
        return (
          <div key={ring.label}>
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-border/60"
              style={{ width: `${ring.size}%`, height: `${ring.size}%` }}
            />
            <span
              className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap bg-card px-2 text-xs text-muted-foreground"
              style={{ top: `${inset}%` }}
            >
              {ring.label}
            </span>
          </div>
        )
      })}

      {members.map((member) => {
        const active = member.id === selectedId
        const interactive = !member.isYou
        return (
          <button
            key={member.id}
            type="button"
            disabled={!interactive}
            aria-pressed={interactive ? active : undefined}
            aria-label={`${member.name}, ${member.role}, ${member.distance} miles away`}
            onClick={() => interactive && onSelect(member.id)}
            className={cn(
              "absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border font-mono text-sm font-semibold transition-[transform,box-shadow] duration-200",
              member.emphasis ? "size-16" : "size-12",
              interactive
                ? "cursor-pointer hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                : "cursor-default",
              active && "z-10 scale-110",
            )}
            style={{
              left: `${member.x}%`,
              top: `${member.y}%`,
              ...memberNodeStyle(member.color, active || Boolean(member.isYou)),
              boxShadow: active
                ? "0 0 0 4px color-mix(in oklch, var(--primary-bright) 45%, transparent)"
                : undefined,
            }}
          >
            {member.initials}
          </button>
        )
      })}
    </div>
  )
}
