"use client"

import { cn } from "@/lib/utils"

import { memberNodeStyle, type ProximityMember } from "./proximity-data"

export function NearbyList({
  members,
  selectedId,
  onSelect,
}: {
  members: ProximityMember[]
  selectedId: string | null
  onSelect: (id: string) => void
}) {
  return (
    <div className="flex min-h-0 flex-col gap-1">
      <span className="px-1 pb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Nearby · {members.length}
      </span>
      <ul className="flex min-h-0 flex-col gap-0.5 overflow-y-auto">
        {members.map((member) => {
          const active = member.id === selectedId
          return (
            <li key={member.id}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onSelect(member.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border border-transparent px-2 py-2 text-left transition-colors",
                  "hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active && "border-border bg-accent",
                )}
              >
                <span
                  className="flex size-9 shrink-0 items-center justify-center rounded-full border font-mono text-xs font-semibold"
                  style={memberNodeStyle(member.color, active)}
                >
                  {member.initials}
                </span>
                <span className="flex min-w-0 flex-col">
                  <span className="truncate text-sm font-medium">{member.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {member.role}
                  </span>
                </span>
                <span className="ml-auto shrink-0 text-sm text-muted-foreground">
                  {member.distance} mi
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
