"use client"

import * as React from "react"
import dynamic from "next/dynamic"

import {
  CheckInListDrawer,
  CheckInSurface,
} from "@/components/now/check-in-surface"
import type {
  CheckInBundleSelection,
  FlyToTarget,
} from "@/components/now/now-map"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { XIcon } from "lucide-react"
import {
  checkInAtLocation,
  checkInBySearch,
  clearCheckIn,
  refreshNearbyCheckIns,
  reloadCheckInMapData,
} from "@/lib/now/actions"
import type { CheckInMapData, CheckedInMember } from "@/lib/now/check-in"
import type { Coordinates } from "@/lib/now/geo"
import type { Person } from "@/lib/people-data"
import { cn } from "@/lib/utils"

const NowMap = dynamic(
  () => import("@/components/now/now-map").then((mod) => mod.NowMap),
  { ssr: false },
)

type PendingLocation = {
  latitude: number
  longitude: number
  city: string | null
} | null

export type CheckInDialogIntent = {
  type: "bundle"
  members: CheckedInMember[]
  cityLabel: string
  center: Coordinates
}

function insecureLocationMessage(): string {
  return "Location requires a secure connection (HTTPS). Open the production site, or use localhost on this device—not a LAN IP over HTTP."
}

function requestCurrentPositionOnce(
  enableHighAccuracy: boolean,
): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy,
      timeout: 15000,
      maximumAge: 60_000,
    })
  })
}

async function requestCurrentPosition(): Promise<GeolocationPosition> {
  if (!navigator.geolocation) {
    throw new Error("Location is not supported in this browser.")
  }
  if (typeof window !== "undefined" && !window.isSecureContext) {
    throw new Error(insecureLocationMessage())
  }

  try {
    return await requestCurrentPositionOnce(true)
  } catch (first) {
    const code =
      first && typeof first === "object" && "code" in first
        ? (first as GeolocationPositionError).code
        : null
    if (code === 1) {
      throw first
    }
    return requestCurrentPositionOnce(false)
  }
}

function geolocationErrorMessage(error: GeolocationPositionError | Error): string {
  if ("code" in error) {
    if (error.code === error.PERMISSION_DENIED) {
      return "Location access denied. Allow location for this site in iOS Settings → Safari → Location (or the AWN app)."
    }
    if (error.code === error.POSITION_UNAVAILABLE) {
      return "Location unavailable. Try again in a moment."
    }
    if (error.code === error.TIMEOUT) {
      return "Location timed out. Try again near a window or with Wi‑Fi on."
    }
  }
  if (error.message.includes("secure connection")) {
    return error.message
  }
  return error.message || "Could not get location."
}

async function geocodePlaceClient(
  query: string,
): Promise<(Coordinates & { city?: string }) | null> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim()
  const trimmed = query.trim()
  if (!token || !trimmed) return null

  const url = new URL(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(trimmed)}.json`,
  )
  url.searchParams.set("access_token", token)
  url.searchParams.set("limit", "1")
  url.searchParams.set("types", "place,locality,neighborhood,region")

  const response = await fetch(url)
  if (!response.ok) return null

  const data = (await response.json()) as {
    features?: { center?: [number, number]; text?: string; place_name?: string }[]
  }
  const feature = data.features?.[0]
  const center = feature?.center
  if (!center) return null

  const city =
    feature.text?.trim() ||
    feature.place_name?.split(",")[0]?.trim() ||
    undefined

  return {
    longitude: center[0],
    latitude: center[1],
    city,
  }
}

async function reverseGeocodeClient(
  coords: Coordinates,
): Promise<string | null> {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim()
  if (!token) return null

  const url = new URL(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords.longitude},${coords.latitude}.json`,
  )
  url.searchParams.set("access_token", token)
  url.searchParams.set("limit", "1")
  url.searchParams.set("types", "place,locality,neighborhood")

  const response = await fetch(url)
  if (!response.ok) return null

  const data = (await response.json()) as {
    features?: { text?: string; place_name?: string }[]
  }
  const feature = data.features?.[0]
  if (!feature) return null

  return (
    feature.text?.trim() ||
    feature.place_name?.split(",")[0]?.trim() ||
    null
  )
}

export function WhosAroundCard({
  className,
  initialMapData,
}: {
  className?: string
  initialMapData: CheckInMapData
}) {
  const [mapData, setMapData] = React.useState(initialMapData)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [editLocationQuery, setEditLocationQuery] = React.useState("")
  const [pendingLocation, setPendingLocation] =
    React.useState<PendingLocation>(null)
  const [draftNote, setDraftNote] = React.useState("")
  const [checkInPopoverOpen, setCheckInPopoverOpen] = React.useState(false)
  const [editPopoverOpen, setEditPopoverOpen] = React.useState(false)
  const [bundlePopoverOpen, setBundlePopoverOpen] = React.useState(false)
  const [bundleMembers, setBundleMembers] = React.useState<CheckedInMember[]>(
    [],
  )
  const [bundleCityLabel, setBundleCityLabel] = React.useState("Nearby")
  const [selectedMemberId, setSelectedMemberId] = React.useState<string | null>(
    null,
  )
  const [listDrawerPerson, setListDrawerPerson] = React.useState<Person | null>(
    null,
  )
  const [locatePending, setLocatePending] = React.useState(false)
  const [submitPending, setSubmitPending] = React.useState(false)
  const [submitError, setSubmitError] = React.useState<string | null>(null)
  const [flyTo, setFlyTo] = React.useState<FlyToTarget | null>(null)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [dialogIntent, setDialogIntent] =
    React.useState<CheckInDialogIntent | null>(null)
  const nearbyPreviewGeneration = React.useRef(0)

  async function refreshNearbyForView(
    latitude: number,
    longitude: number,
    city?: string | null,
  ) {
    const generation = ++nearbyPreviewGeneration.current
    const result = await refreshNearbyCheckIns({
      latitude,
      longitude,
      city,
    })
    if (generation !== nearbyPreviewGeneration.current) return
    if (result.ok) {
      setMapData(result.mapData)
    }
  }

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setMapData((current) => ({ ...current }))
    }, 60_000)
    return () => window.clearInterval(id)
  }, [])

  React.useEffect(() => {
    if (!dialogOpen || !dialogIntent) return

    if (dialogIntent.type === "bundle") {
      setBundleMembers(dialogIntent.members)
      setBundleCityLabel(dialogIntent.cityLabel)
      setBundlePopoverOpen(true)
      setFlyTo({
        ...dialogIntent.center,
        zoom: 14,
      })
    }

    setDialogIntent(null)
  }, [dialogOpen, dialogIntent])

  function clearSearchState() {
    setSearchQuery("")
    setPendingLocation(null)
    setSubmitError(null)
    setFlyTo(null)
    nearbyPreviewGeneration.current += 1
    void reloadCheckInMapData().then((result) => {
      if (result.ok) setMapData(result.mapData)
    })
  }

  React.useEffect(() => {
    if (mapData.ownCheckIn) return

    const query = searchQuery.trim()
    if (!query) return

    const timer = window.setTimeout(() => {
      void (async () => {
        const geocoded = await geocodePlaceClient(query)
        if (!geocoded) return

        setPendingLocation({
          latitude: geocoded.latitude,
          longitude: geocoded.longitude,
          city: geocoded.city ?? null,
        })
        setFlyTo({
          latitude: geocoded.latitude,
          longitude: geocoded.longitude,
          zoom: 11.5,
        })
        await refreshNearbyForView(
          geocoded.latitude,
          geocoded.longitude,
          geocoded.city ?? null,
        )
      })()
    }, 500)

    return () => window.clearTimeout(timer)
  }, [searchQuery, mapData.ownCheckIn])

  async function handleLocate() {
    setLocatePending(true)
    setSubmitError(null)

    try {
      const position = await requestCurrentPosition()
      const latitude = position.coords.latitude
      const longitude = position.coords.longitude
      const city = await reverseGeocodeClient({ latitude, longitude })

      setPendingLocation({ latitude, longitude, city })
      setSearchQuery(city ?? "Current location")
      setFlyTo({ latitude, longitude, zoom: 11.5 })
      await refreshNearbyForView(latitude, longitude, city)
    } catch (error) {
      const geoError: GeolocationPositionError | Error =
        error && typeof error === "object" && "code" in error
          ? (error as GeolocationPositionError)
          : error instanceof Error
            ? error
            : new Error("Could not get location.")
      setSubmitError(geolocationErrorMessage(geoError))
    } finally {
      setLocatePending(false)
    }
  }

  async function previewMapForPendingCheckIn() {
    if (pendingLocation) {
      setFlyTo({
        latitude: pendingLocation.latitude,
        longitude: pendingLocation.longitude,
        zoom: 11.5,
      })
      await refreshNearbyForView(
        pendingLocation.latitude,
        pendingLocation.longitude,
        pendingLocation.city,
      )
      return
    }

    const query = searchQuery.trim()
    if (!query) return

    const geocoded = await geocodePlaceClient(query)
    if (!geocoded) return

    setPendingLocation({
      latitude: geocoded.latitude,
      longitude: geocoded.longitude,
      city: geocoded.city ?? null,
    })
    setFlyTo({
      latitude: geocoded.latitude,
      longitude: geocoded.longitude,
      zoom: 11.5,
    })
    await refreshNearbyForView(
      geocoded.latitude,
      geocoded.longitude,
      geocoded.city ?? null,
    )
  }

  async function handlePrimaryCheckIn() {
    await previewMapForPendingCheckIn()
    setCheckInPopoverOpen(true)
  }

  function handleOpenEdit() {
    const own = mapData.ownCheckIn
    if (!own) return

    setEditLocationQuery(own.city ?? mapData.cityLabel)
    setDraftNote(own.note ?? "")
    setEditPopoverOpen(true)
  }

  async function submitCheckIn() {
    setSubmitPending(true)
    setSubmitError(null)

    try {
      const result = pendingLocation
        ? await checkInAtLocation({
            latitude: pendingLocation.latitude,
            longitude: pendingLocation.longitude,
            city: pendingLocation.city ?? searchQuery,
            note: draftNote,
          })
        : await checkInBySearch({
            query: searchQuery,
            note: draftNote,
          })

      if (!result.ok) {
        setSubmitError(result.error)
        return
      }

      setMapData(result.mapData)
      setCheckInPopoverOpen(false)
      clearSearchState()
      setDraftNote(result.mapData.ownCheckIn?.note ?? "")
      setFlyTo({
        latitude: result.mapData.origin.latitude,
        longitude: result.mapData.origin.longitude,
        zoom: 11.5,
      })
      setSelectedMemberId(null)
    } finally {
      setSubmitPending(false)
    }
  }

  async function submitEdit() {
    const own = mapData.ownCheckIn
    if (!own) return

    setSubmitPending(true)
    setSubmitError(null)

    try {
      const locationChanged =
        editLocationQuery.trim() !== (own.city ?? "").trim()

      const result = locationChanged
        ? await checkInBySearch({
            query: editLocationQuery,
            note: draftNote,
          })
        : await checkInAtLocation({
            latitude: own.latitude,
            longitude: own.longitude,
            city: own.city,
            note: draftNote,
          })

      if (!result.ok) {
        setSubmitError(result.error)
        return
      }

      setMapData(result.mapData)
      setEditPopoverOpen(false)
      setDraftNote(result.mapData.ownCheckIn?.note ?? "")
      setFlyTo({
        latitude: result.mapData.origin.latitude,
        longitude: result.mapData.origin.longitude,
        zoom: 11.5,
      })
    } finally {
      setSubmitPending(false)
    }
  }

  async function handleClearCheckIn() {
    setSubmitPending(true)
    setSubmitError(null)

    try {
      const result = await clearCheckIn()
      if (!result.ok) {
        setSubmitError(result.error)
        return
      }

      setMapData(result.mapData)
      clearSearchState()
      setDraftNote("")
      setEditLocationQuery("")
      setCheckInPopoverOpen(false)
      setEditPopoverOpen(false)
      setBundlePopoverOpen(false)
      setSelectedMemberId(null)
      setFlyTo(null)
    } finally {
      setSubmitPending(false)
    }
  }

  function handleBundleMemberClick(member: CheckedInMember) {
    setSelectedMemberId(null)
    setListDrawerPerson(member.person)
    setBundlePopoverOpen(false)
  }

  function handleSelectBundle(
    variant: "inline" | "expanded",
    selection: CheckInBundleSelection,
  ) {
    if (variant === "inline") {
      setDialogIntent({
        type: "bundle",
        members: selection.members,
        cityLabel: selection.cityLabel,
        center: selection.center,
      })
      setDialogOpen(true)
      return
    }

    setBundleMembers(selection.members)
    setBundleCityLabel(selection.cityLabel)
    setBundlePopoverOpen(true)
  }

  function renderMap(variant: "inline" | "expanded") {
    return (
      <NowMap
        mapInstanceId={`now-check-in-${variant}`}
        members={mapData.members}
        origin={mapData.origin}
        ownCheckIn={mapData.ownCheckIn}
        selectedMemberId={selectedMemberId}
        onSelectMember={setSelectedMemberId}
        onSelectBundle={(selection) => handleSelectBundle(variant, selection)}
        flyTo={flyTo}
        resizeWhen={variant === "expanded" ? dialogOpen : undefined}
      />
    )
  }

  const inlineMapSlot = dialogOpen ? (
    <div
      className="absolute inset-0 bg-[repeating-linear-gradient(135deg,oklch(0.17_0.006_285.885)_0px,oklch(0.17_0.006_285.885)_12px,oklch(0.14_0.005_285.823)_12px,oklch(0.14_0.005_285.823)_24px)]"
      aria-hidden
    />
  ) : (
    renderMap("inline")
  )

  const surfaceProps = {
    mapData,
    searchQuery,
    onSearchQueryChange: setSearchQuery,
    editLocationQuery,
    onEditLocationQueryChange: setEditLocationQuery,
    draftNote,
    onDraftNoteChange: setDraftNote,
    checkInPopoverOpen,
    onCheckInPopoverOpenChange: setCheckInPopoverOpen,
    editPopoverOpen,
    onEditPopoverOpenChange: setEditPopoverOpen,
    bundlePopoverOpen,
    onBundlePopoverOpenChange: setBundlePopoverOpen,
    bundleMembers,
    bundleCityLabel,
    locatePending,
    submitPending,
    submitError,
    onLocate: () => void handleLocate(),
    onClearSearch: clearSearchState,
    onSubmitCheckIn: () => void submitCheckIn(),
    onSubmitEdit: () => void submitEdit(),
    onClearCheckIn: () => void handleClearCheckIn(),
    onBundleMemberClick: handleBundleMemberClick,
  }

  return (
    <>
      <Card
        className={cn(
          "relative min-h-80 overflow-hidden p-0 ring-0 lg:min-h-140",
          className,
        )}
      >
        <div className="absolute inset-0">
          <CheckInSurface
            variant="inline"
            {...surfaceProps}
            mountPopovers={!dialogOpen}
            onPrimaryCheckIn={() => void handlePrimaryCheckIn()}
            onOpenEdit={() => handleOpenEdit()}
            onExpand={() => setDialogOpen(true)}
            mapSlot={inlineMapSlot}
          />
        </div>
      </Card>

      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setListDrawerPerson(null)
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="flex h-[min(720px,90dvh)] w-[min(1100px,calc(100%-2rem))] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none"
        >
          <DialogTitle className="sr-only">On the Road</DialogTitle>
          <DialogDescription className="sr-only">
            Check in and see who is nearby on the map.
          </DialogDescription>
          <DialogClose
            render={
              <Button
                variant="ghost"
                size="icon-sm"
                className="absolute top-3 right-3 z-50 touch-manipulation bg-background/90 sm:top-4 sm:right-4"
                aria-label="Close"
              />
            }
          >
            <XIcon />
          </DialogClose>
          <div className="relative flex min-h-0 flex-1 flex-col">
            {dialogOpen ? (
              <CheckInSurface
                variant="expanded"
                {...surfaceProps}
                onPrimaryCheckIn={() => void handlePrimaryCheckIn()}
                onOpenEdit={() => handleOpenEdit()}
                mapSlot={renderMap("expanded")}
              />
            ) : null}
            {dialogOpen && listDrawerPerson ? (
              <CheckInListDrawer
                modal={false}
                person={listDrawerPerson}
                onClose={() => setListDrawerPerson(null)}
              />
            ) : null}
          </div>
        </DialogContent>
      </Dialog>

      {!dialogOpen ? (
        <CheckInListDrawer
          person={listDrawerPerson}
          onClose={() => setListDrawerPerson(null)}
        />
      ) : null}
    </>
  )
}
