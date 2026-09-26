"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { Maximize2 } from "lucide-react"

import { PersonProfileDrawer } from "@/components/people/person-profile-drawer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { checkInAtLocation } from "@/lib/now/actions"
import type { CheckInMapData, CheckedInMember } from "@/lib/now/check-in"
import type { Coordinates } from "@/lib/now/geo"
import { initials } from "@/lib/people-data"
import type { Person } from "@/lib/people-data"
import { cn } from "@/lib/utils"

const NowMap = dynamic(
  () => import("@/components/now/now-map").then((mod) => mod.NowMap),
  { ssr: false },
)

function requestCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Location is not supported in this browser."))
      return
    }

    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60_000,
    })
  })
}

function geolocationErrorMessage(error: GeolocationPositionError | Error): string {
  if ("code" in error) {
    if (error.code === error.PERMISSION_DENIED) {
      return "Location access denied. Enable location to check in."
    }
    if (error.code === error.POSITION_UNAVAILABLE) {
      return "Location unavailable. Try again."
    }
    if (error.code === error.TIMEOUT) {
      return "Location timed out. Try again."
    }
  }
  return error.message || "Could not get location."
}

type OnTheRoadSurfaceProps = {
  variant: "inline" | "expanded"
  mapData: CheckInMapData
  selectedMemberId: string | null
  onSelectMember: (memberId: string | null) => void
  flyTo: Coordinates | null
  mapResizeWhen?: boolean | number
  checkInLabel: string
  checkInPending: boolean
  checkInError: string | null
  onCheckIn: () => void
  onListMemberClick: (member: CheckedInMember) => void
  onExpand?: () => void
}

function OnTheRoadSurface({
  variant,
  mapData,
  selectedMemberId,
  onSelectMember,
  flyTo,
  mapResizeWhen,
  checkInLabel,
  checkInPending,
  checkInError,
  onCheckIn,
  onListMemberClick,
  onExpand,
}: OnTheRoadSurfaceProps) {
  const isInline = variant === "inline"

  return (
    <div
      className={cn(
        "relative flex min-h-0 flex-1 flex-col",
        isInline ? "min-h-80 lg:min-h-140" : "min-h-0 flex-1",
      )}
    >
      <div
        className={cn(
          "relative min-h-0 flex-1",
          isInline && "min-h-80 lg:min-h-140",
        )}
      >
        <NowMap
          members={mapData.members}
          origin={mapData.origin}
          ownCheckIn={mapData.ownCheckIn}
          selectedMemberId={selectedMemberId}
          onSelectMember={onSelectMember}
          flyTo={flyTo}
          resizeWhen={mapResizeWhen}
        />

        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 sm:p-4">
          <div className="pointer-events-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Input
              placeholder="Search city, venue or crew…"
              className="max-w-md border-border bg-background/90 backdrop-blur-sm"
              aria-label="Search city, venue or crew"
              disabled
            />
            <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
              <Button
                className={cn(isInline && "hidden sm:inline-flex")}
                onClick={() => void onCheckIn()}
                disabled={checkInPending}
                variant={checkInError ? "destructive" : "default"}
              >
                {checkInLabel}
              </Button>
              {isInline && onExpand ? (
                <Button
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  className="border-border bg-background/90 backdrop-blur-sm"
                  aria-label="Expand On the Road"
                  onClick={onExpand}
                >
                  <Maximize2 />
                </Button>
              ) : null}
            </div>
          </div>

          <div className="pointer-events-auto">
            <div className="max-w-xs rounded-xl border border-border/80 bg-background/90 p-3 backdrop-blur-sm">
              <p className="font-heading text-base font-medium">
                {mapData.cityLabel}
              </p>
              <p className="text-sm text-muted-foreground">
                {mapData.checkedInCount} checked in nearby
              </p>
              {mapData.members.length > 0 ? (
                <ul className="mt-3 max-h-40 space-y-2 overflow-y-auto">
                  {mapData.members.map((member) => (
                    <li key={member.person.id}>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-md text-left text-sm transition-colors hover:bg-muted/60"
                        onClick={() => onListMemberClick(member)}
                      >
                        <Avatar size="sm">
                          <AvatarImage
                            src={member.person.avatar || undefined}
                            alt=""
                          />
                          <AvatarFallback className="text-xs font-medium">
                            {initials(member.person.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span>
                          <span className="font-medium">
                            {member.person.name}
                          </span>
                          {member.person.role ? (
                            <span className="text-muted-foreground">
                              {" "}
                              · {member.person.role}
                            </span>
                          ) : null}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  {mapData.origin.source === "none"
                    ? "Add a home base on your profile to see who is nearby."
                    : "No one checked in nearby yet."}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
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
  const [selectedMemberId, setSelectedMemberId] = React.useState<string | null>(
    null,
  )
  const [listDrawerPerson, setListDrawerPerson] = React.useState<Person | null>(
    null,
  )
  const [checkInPending, setCheckInPending] = React.useState(false)
  const [checkInError, setCheckInError] = React.useState<string | null>(null)
  const [flyTo, setFlyTo] = React.useState<Coordinates | null>(null)
  const [expandedOpen, setExpandedOpen] = React.useState(false)

  async function handleCheckIn() {
    setCheckInPending(true)
    setCheckInError(null)

    try {
      const position = await requestCurrentPosition()
      const latitude = position.coords.latitude
      const longitude = position.coords.longitude

      const result = await checkInAtLocation({ latitude, longitude })
      if (!result.ok) {
        setCheckInError(result.error)
        return
      }

      setMapData(result.mapData)
      setFlyTo({ latitude, longitude })
      setSelectedMemberId(null)
    } catch (error) {
      setCheckInError(
        geolocationErrorMessage(
          error instanceof Error ? error : new Error("Could not get location."),
        ),
      )
    } finally {
      setCheckInPending(false)
    }
  }

  function handleListMemberClick(member: CheckedInMember) {
    setSelectedMemberId(null)
    setListDrawerPerson(member.person)
  }

  const checkInLabel = checkInPending
    ? "Checking in…"
    : checkInError
      ? checkInError
      : "Check in here"

  const surfaceProps: Omit<OnTheRoadSurfaceProps, "variant" | "onExpand" | "mapResizeWhen"> = {
    mapData,
    selectedMemberId,
    onSelectMember: setSelectedMemberId,
    flyTo,
    checkInLabel,
    checkInPending,
    checkInError,
    onCheckIn: () => void handleCheckIn(),
    onListMemberClick: handleListMemberClick,
  }

  return (
    <>
      <Card
        className={cn(
          "relative min-h-80 overflow-hidden p-0 ring-0 lg:min-h-140",
          className,
        )}
      >
        <OnTheRoadSurface
          variant="inline"
          {...surfaceProps}
          onExpand={() => setExpandedOpen(true)}
        />

        <div className="border-t border-border p-3 lg:hidden">
          <Button
            className="w-full"
            onClick={() => void handleCheckIn()}
            disabled={checkInPending}
            variant={checkInError ? "destructive" : "default"}
          >
            {checkInLabel}
          </Button>
        </div>
      </Card>

      <Dialog open={expandedOpen} onOpenChange={setExpandedOpen}>
        <DialogContent className="flex h-[min(720px,90dvh)] w-[min(1100px,calc(100%-2rem))] max-w-none flex-col gap-0 overflow-hidden p-0 sm:max-w-none">
          <DialogTitle className="sr-only">On the Road</DialogTitle>
          <DialogDescription className="sr-only">
            Check in and see who is nearby on the map.
          </DialogDescription>
          {expandedOpen ? (
            <OnTheRoadSurface
              variant="expanded"
              {...surfaceProps}
              mapResizeWhen={expandedOpen}
            />
          ) : null}
        </DialogContent>
      </Dialog>

      {listDrawerPerson ? (
        <PersonProfileDrawer
          person={listDrawerPerson}
          open={Boolean(listDrawerPerson)}
          onOpenChange={(open) => {
            if (!open) setListDrawerPerson(null)
          }}
        />
      ) : null}
    </>
  )
}
