"use client"

import * as React from "react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  featuredGroups,
  groupsJoinTarget,
  totalGroupCount,
} from "@/lib/now/now-data"
import { cn } from "@/lib/utils"

function GroupRow({
  emoji,
  name,
  joined,
  onToggle,
}: {
  emoji: string
  name: string
  joined: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/40 px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2.5">
        <span aria-hidden className="text-base leading-none">
          {emoji}
        </span>
        <span className="truncate text-sm font-medium">{name}</span>
      </div>
      <Button
        type="button"
        size="sm"
        variant={joined ? "secondary" : "default"}
        className="shrink-0 rounded-full px-4"
        onClick={onToggle}
      >
        {joined ? "Joined" : "Join"}
      </Button>
    </div>
  )
}

function GroupChip({
  emoji,
  name,
  joined,
  onToggle,
}: {
  emoji: string
  name: string
  joined: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
        joined
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-background/40 text-foreground hover:bg-muted/50",
      )}
    >
      <span aria-hidden>{emoji}</span>
      <span>{name}</span>
    </button>
  )
}

export function ChooseGroupsCard({ className }: { className?: string }) {
  const [joinedIds, setJoinedIds] = React.useState<Set<string>>(() => new Set())

  const joinedCount = joinedIds.size

  function toggleGroup(id: string) {
    setJoinedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  return (
    <Card className={cn("min-w-0", className)}>
      <CardHeader>
        <CardTitle>Choose your groups</CardTitle>
        <CardAction>
          <span className="text-sm text-muted-foreground tabular-nums">
            {joinedCount}/{groupsJoinTarget}
          </span>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="hidden flex-col gap-2 lg:flex">
          {featuredGroups.map((group) => (
            <GroupRow
              key={group.id}
              emoji={group.emoji}
              name={group.name}
              joined={joinedIds.has(group.id)}
              onToggle={() => toggleGroup(group.id)}
            />
          ))}
        </div>

        <div className="flex flex-wrap gap-2 lg:hidden">
          {featuredGroups.slice(0, 3).map((group) => (
            <GroupChip
              key={group.id}
              emoji={group.emoji}
              name={group.name.replace(" & Video", "").replace(" & Stage", "")}
              joined={joinedIds.has(group.id)}
              onToggle={() => toggleGroup(group.id)}
            />
          ))}
        </div>

        <Link
          href="/groups"
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          See all {totalGroupCount} groups
        </Link>
      </CardContent>
    </Card>
  )
}
