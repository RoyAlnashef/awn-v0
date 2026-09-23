"use client"

import * as React from "react"
import dynamic from "next/dynamic"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  homeBase,
  mapFilters,
  nearbyCrew,
  type MapFilter,
} from "@/lib/now/now-data"
import { cn } from "@/lib/utils"

const NowMap = dynamic(
  () => import("@/components/now/now-map").then((mod) => mod.NowMap),
  { ssr: false },
)

export function WhosAroundCard({ className }: { className?: string }) {
  const [filter, setFilter] = React.useState<MapFilter>("everyone")

  return (
    <Card
      className={cn(
        "relative min-h-80 overflow-hidden p-0 ring-0 lg:min-h-140",
        className,
      )}
    >
      <div className="relative min-h-80 lg:min-h-140">
        <NowMap />

        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 sm:p-4">
          <div className="pointer-events-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Input
              placeholder="Search city, venue or crew…"
              className="max-w-md border-border bg-background/90 backdrop-blur-sm"
              aria-label="Search city, venue or crew"
            />
            <Button className="hidden shrink-0 sm:inline-flex">
              Check in here
            </Button>
          </div>

          <div className="pointer-events-auto flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xs rounded-xl border border-border/80 bg-background/90 p-3 backdrop-blur-sm">
              <p className="font-heading text-base font-medium">{homeBase.city}</p>
              <p className="text-sm text-muted-foreground">
                {homeBase.checkedInCount} checked in nearby
              </p>
              <ul className="mt-3 space-y-2">
                {nearbyCrew.map((member) => (
                  <li key={member.id} className="flex items-center gap-2 text-sm">
                    <Avatar size="sm">
                      <AvatarFallback
                        className={cn("text-xs font-medium", member.avatarClassName)}
                      >
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                    <span>
                      <span className="font-medium">{member.name}</span>
                      <span className="text-muted-foreground"> · {member.role}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col gap-1 self-end">
              {mapFilters.map((item) => (
                <Button
                  key={item.id}
                  type="button"
                  size="sm"
                  variant={filter === item.id ? "default" : "outline"}
                  className="backdrop-blur-sm"
                  onClick={() => setFilter(item.id)}
                  aria-pressed={filter === item.id}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border p-3 lg:hidden">
        <Button className="w-full">Check in here</Button>
      </div>
    </Card>
  )
}
