"use client"

import * as React from "react"
import MapGL, { Marker, type MapRef } from "react-map-gl/mapbox"
import Supercluster from "supercluster"
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

export type FlyToTarget = Coordinates & { zoom?: number }

export type CheckInBundleSelection = {
  members: CheckedInMember[]
  cityLabel: string
  center: Coordinates
}

type MemberPointProperties = {
  memberId: string
}

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
          <Avatar
            className={cn(
              "size-9 border-2 shadow-md transition-transform hover:scale-110",
              availability.avatarBorder,
              selected &&
                "ring-2 ring-primary ring-offset-2 ring-offset-background",
            )}
          >
            <AvatarImage src={member.person.avatar || undefined} alt="" />
            <AvatarFallback className="text-xs">
              {initials(member.person.name)}
            </AvatarFallback>
          </Avatar>
        </button>
      }
    />
  )
}

function SelfYouMarker({
  name,
  avatarUrl,
}: {
  name: string
  avatarUrl?: string
}) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <Avatar className="size-9 border-2 border-chart-2 shadow-md ring-4 ring-chart-2/25">
        <AvatarImage src={avatarUrl} alt="" />
        <AvatarFallback className="text-xs font-medium">
          {initials(name)}
        </AvatarFallback>
      </Avatar>
      <span className="text-[10px] font-semibold tracking-wide text-chart-2 uppercase">
        You
      </span>
    </div>
  )
}

export function NowMap({
  members,
  origin,
  ownCheckIn,
  selectedMemberId,
  onSelectMember,
  onSelectBundle,
  flyTo,
  className,
  resizeWhen,
  mapInstanceId = "now-map",
}: {
  members: CheckedInMember[]
  origin: MapOrigin
  ownCheckIn: Pick<CheckedInMember, "latitude" | "longitude"> | null
  selectedMemberId: string | null
  onSelectMember: (memberId: string | null) => void
  onSelectBundle?: (selection: CheckInBundleSelection) => void
  flyTo?: FlyToTarget | null
  className?: string
  resizeWhen?: boolean | number
  mapInstanceId?: string
}) {
  const [ready, setReady] = React.useState(false)
  const [mapZoom, setMapZoom] = React.useState(origin.source === "none" ? 4 : 11.5)
  const [mapBounds, setMapBounds] = React.useState<[number, number, number, number] | null>(
    null,
  )
  const mapRef = React.useRef<MapRef>(null)

  const selfMember = React.useMemo(
    () => members.find((member) => member.isSelf) ?? null,
    [members],
  )

  const membersForCluster = React.useMemo(
    () => members.filter((member) => !member.isSelf),
    [members],
  )

  const memberById = React.useMemo(
    () => new Map(membersForCluster.map((member) => [member.person.id, member])),
    [membersForCluster],
  )

  const clusterIndex = React.useMemo(() => {
    const index = new Supercluster<MemberPointProperties, MemberPointProperties>({
      radius: 56,
      maxZoom: 20,
    })
    index.load(
      membersForCluster.map((member) => ({
        type: "Feature",
        properties: { memberId: member.person.id },
        geometry: {
          type: "Point",
          coordinates: [member.longitude, member.latitude] as [number, number],
        },
      })),
    )
    return index
  }, [membersForCluster])

  const clusters = React.useMemo(() => {
    if (!mapBounds) return []
    return clusterIndex.getClusters(mapBounds, Math.floor(mapZoom))
  }, [clusterIndex, mapBounds, mapZoom])

  const syncMapView = React.useCallback(() => {
    const map = mapRef.current?.getMap()
    if (!map) return
    const bounds = map.getBounds()
    if (!bounds) return
    setMapZoom(map.getZoom())
    setMapBounds([
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    ])
  }, [])

  React.useEffect(() => {
    if (!flyTo || !mapRef.current || !ready) return

    const applyFlyTo = () => {
      const map = mapRef.current?.getMap()
      if (!map || !mapRef.current) return
      map.resize()
      mapRef.current.flyTo({
        center: [flyTo.longitude, flyTo.latitude],
        zoom: flyTo.zoom ?? 11.5,
        duration: 1200,
      })
      syncMapView()
    }

    if (resizeWhen) {
      const frame = requestAnimationFrame(() => {
        requestAnimationFrame(applyFlyTo)
      })
      return () => cancelAnimationFrame(frame)
    }

    applyFlyTo()
  }, [flyTo, resizeWhen, ready, syncMapView])

  React.useEffect(() => {
    if (resizeWhen === undefined || resizeWhen === false) return
    const frame = requestAnimationFrame(() => {
      mapRef.current?.getMap()?.resize()
      syncMapView()
    })
    return () => cancelAnimationFrame(frame)
  }, [resizeWhen, syncMapView])

  function handleClusterClick(
    clusterId: number,
    longitude: number,
    latitude: number,
  ) {
    const expansionZoom = clusterIndex.getClusterExpansionZoom(clusterId)
    const canExpand = expansionZoom > mapZoom + 0.05

    if (canExpand) {
      mapRef.current?.flyTo({
        center: [longitude, latitude],
        zoom: Math.min(expansionZoom, 18),
        duration: 800,
      })
      return
    }

    const leaves = clusterIndex.getLeaves(clusterId, Infinity)
    const bundleMembers = leaves
      .map((leaf) => memberById.get(leaf.properties.memberId))
      .filter((member): member is CheckedInMember => Boolean(member))

    if (bundleMembers.length === 0) return

    const cityLabel =
      bundleMembers.find((member) => member.city)?.city ?? "Nearby"

    onSelectBundle?.({
      members: bundleMembers,
      cityLabel,
      center: { latitude, longitude },
    })
  }

  if (!mapboxToken) {
    return <MapFallback />
  }

  const centerPin = ownCheckIn ?? origin

  return (
    <div className={cn("absolute inset-0", className)}>
      {!ready ? <MapFallback /> : null}
      <div className={cn("size-full", !ready && "opacity-0")}>
        <MapGL
          id={mapInstanceId}
          ref={mapRef}
          mapboxAccessToken={mapboxToken}
          initialViewState={{
            longitude: flyTo?.longitude ?? centerPin.longitude,
            latitude: flyTo?.latitude ?? centerPin.latitude,
            zoom: flyTo?.zoom ?? (origin.source === "none" ? 4 : 11.5),
          }}
          mapStyle="mapbox://styles/awnroy/cmudf5a6z00ai01smeysi7h70"
          attributionControl={false}
          reuseMaps={false}
          onLoad={() => {
            setReady(true)
            syncMapView()
          }}
          onMoveEnd={syncMapView}
          style={{ width: "100%", height: "100%" }}
        >
          {ownCheckIn ? (
            <Marker
              longitude={ownCheckIn.longitude}
              latitude={ownCheckIn.latitude}
              anchor="center"
            >
              <SelfYouMarker
                name={selfMember?.person.name ?? "You"}
                avatarUrl={selfMember?.person.avatar || undefined}
              />
            </Marker>
          ) : null}

          {clusters.map((feature) => {
            const [longitude, latitude] = feature.geometry.coordinates
            const props = feature.properties

            if ("cluster" in props && props.cluster) {
              const clusterId = props.cluster_id as number
              const count = props.point_count as number
              return (
                <Marker
                  key={`cluster-${clusterId}`}
                  longitude={longitude}
                  latitude={latitude}
                  anchor="center"
                >
                  <button
                    type="button"
                    className="flex size-9 items-center justify-center rounded-full bg-foreground text-sm font-semibold text-background shadow-md transition-transform hover:scale-105"
                    aria-label={`${count} crew nearby`}
                    onClick={() =>
                      handleClusterClick(clusterId, longitude, latitude)
                    }
                  >
                    {count}
                  </button>
                </Marker>
              )
            }

            const member = memberById.get(props.memberId)
            if (!member) return null

            return (
              <Marker
                key={member.person.id}
                longitude={longitude}
                latitude={latitude}
                anchor="center"
              >
                <MapAvatarMarker
                  member={member}
                  selected={selectedMemberId === member.person.id}
                  onSelect={onSelectMember}
                />
              </Marker>
            )
          })}
        </MapGL>
      </div>
    </div>
  )
}
