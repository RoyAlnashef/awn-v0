"use client"

import { useMemo, useState } from "react"
import { MapPin } from "lucide-react"

import { Button } from "@/components/ui/button"

import { MemberDetail } from "./member-detail"
import { NearbyList } from "./nearby-list"
import { proximityMembers } from "./proximity-data"
import { ProximityRadar } from "./proximity-radar"

export function AroundYou() {
  const you = useMemo(() => proximityMembers.find((m) => m.isYou)!, [])
  const nearby = useMemo(
    () =>
      proximityMembers
        .filter((m) => !m.isYou)
        .sort((a, b) => a.distance - b.distance),
    [],
  )

  const [selectedId, setSelectedId] = useState<string>(
    nearby.find((m) => m.id === "dm")?.id ?? nearby[0].id,
  )

  const selected = proximityMembers.find((m) => m.id === selectedId) ?? nearby[0]

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border bg-card">
      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Radar */}
        <div className="flex flex-col gap-4 p-5 lg:col-span-7">
          <div className="flex flex-col gap-1">
            <h2 className="font-heading text-lg font-semibold tracking-tight">
              Around you
            </h2>
            <p className="text-sm text-muted-foreground">
              Denver, CO · 3 nights at Mission Ballroom
            </p>
          </div>
          <ProximityRadar
            members={proximityMembers}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
        </div>

        {/* Detail rail */}
        <div className="flex min-h-0 flex-col border-t lg:col-span-5 lg:border-l lg:border-t-0">
          <div className="border-b p-5">
            <MemberDetail member={selected} />
          </div>
          <div className="flex min-h-0 flex-1 flex-col p-4 lg:max-h-[360px]">
            <NearbyList
              members={nearby}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>
          <div className="border-t p-3">
            <Button
              variant="outline"
              className="w-full border-success/40 text-success hover:bg-success/10 hover:text-success"
            >
              <MapPin />
              Checked in · {you.location.split(",")[0]}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
