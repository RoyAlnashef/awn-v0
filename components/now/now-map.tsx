"use client"

import * as React from "react"
import Map, { Marker, type MapRef } from "react-map-gl/mapbox"
import "mapbox-gl/dist/mapbox-gl.css"

import { CheckInMemberPopover } from "@/components/now/check-in-member-popover"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  availabilityConfig,
  initials,
} from "@/lib/people-data"
import type { CheckedInMember } from "@/lib/now/check-in"
import type { Coordinates, MapOrigin } from "@/lib/now/geo"
import { cn } from "@/lib/utils"

const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim()

function MapFallback() {
  return (
    <div
      className="absolute inset-0 bg-[repeating-linear-gradient(135deg,oklch(0.17_0.006_285.885)_0px,oklch(0.17_0.006_285.885)_12px,oklch(0.14_0.005_285.823)_12px,oklch(0.14_0.005_285.823)_24px)]"
      aria-hidden
    >
      <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.2em] text-muted-foreground/60 uppercase">
        Map tiles — AWN dark
      </p>
    </div>
  )
}

function MapAvatarMarker({
  member,
  selected,
  onSelect,
}: {
  member: CheckedInMember
  selected: boolean
  onSelect: (memberId: string | null) => void
}) {
  const availability = availabilityConfig[member.person.availability]

  return (
    <CheckInMemberPopover
      member={member}
      open={selected}
      onOpenChange={(open) => onSelect(open ? member.person.id : null)}
      trigger={
        <button
          type="button"
          className="relative rounded-full focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          aria-label={`View ${member.person.name}'s profile`}
        >
          {member.isSelf ? (
            <span className="relative flex size-8 items-center justify-center">
              <span className="absolute inline-flex size-5 animate-ping rounded-full bg-chart-2/40" />
              <span className="relative inline-flex size-3 rounded-full bg-chart-2 ring-4 ring-chart-2/20" />
            </span>
          ) : (
            <Avatar
              className={cn(
                "size-9 border-2 shadow-md transition-transform hover:scale-110",
                availability.avatarBorder,
                selected && "ring-2 ring-primary ring-offset-2 ring-offset-background",
              )}
            >
              <AvatarImage src={member.person.avatar || undefined} alt="" />
              <AvatarFallback className="text-xs">
                {initials(member.person.name)}
              </AvatarFallback>
            </Avatar>
          )}
        </button>
      }
    />
  )
}

export function NowMap({
  members,
  origin,
  ownCheckIn,
  selectedMemberId,
  onSelectMember,
  flyTo,
  className,
}: {
  members: CheckedInMember[]
  origin: MapOrigin
  ownCheckIn: Pick<CheckedInMember, "latitude" | "longitude"> | null
  selectedMemberId: string | null
  onSelectMember: (memberId: string | null) => void
  flyTo?: Coordinates | null
  className?: string
}) {
  const [ready, setReady] = React.useState(false)
  const mapRef = React.useRef<MapRef>(null)

  React.useEffect(() => {
    if (!flyTo || !mapRef.current) return
    mapRef.current.flyTo({
      center: [flyTo.longitude, flyTo.latitude],
      zoom: 11.5,
      duration: 1200,
    })
  }, [flyTo])

  if (!mapboxToken) {
    return <MapFallback />
  }

  const centerPin = ownCheckIn ?? origin

  return (
    <div className={cn("absolute inset-0", className)}>
      {!ready ? <MapFallback /> : null}
      <div className={cn("size-full", !ready && "opacity-0")}>
        <Map
          ref={mapRef}
          mapboxAccessToken={mapboxToken}
          initialViewState={{
            longitude: centerPin.longitude,
            latitude: centerPin.latitude,
            zoom: origin.source === "none" ? 4 : 11.5,
          }}
          mapStyle="mapbox://styles/awnroy/cmudf5a6z00ai01smeysi7h70"
          attributionControl={false}
          reuseMaps
          onLoad={() => setReady(true)}
          style={{ width: "100%", height: "100%" }}
        >
          {members.map((member) => (
            <Marker
              key={member.person.id}
              longitude={member.longitude}
              latitude={member.latitude}
              anchor="center"
            >
              <MapAvatarMarker
                member={member}
                selected={selectedMemberId === member.person.id}
                onSelect={onSelectMember}
              />
            </Marker>
          ))}
        </Map>
      </div>
    </div>
  )
}
