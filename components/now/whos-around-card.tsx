"use client"

import * as React from "react"
import dynamic from "next/dynamic"

import { PersonProfileDrawer } from "@/components/people/person-profile-drawer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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

  return (
    <>
      <Card
        className={cn(
          "relative min-h-80 overflow-hidden p-0 ring-0 lg:min-h-140",
          className,
        )}
      >
        <div className="relative min-h-80 lg:min-h-140">
          <NowMap
            members={mapData.members}
            origin={mapData.origin}
            ownCheckIn={mapData.ownCheckIn}
            selectedMemberId={selectedMemberId}
            onSelectMember={setSelectedMemberId}
            flyTo={flyTo}
          />

          <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 sm:p-4">
            <div className="pointer-events-auto flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Input
                placeholder="Search city, venue or crew…"
                className="max-w-md border-border bg-background/90 backdrop-blur-sm"
                aria-label="Search city, venue or crew"
                disabled
              />
              <Button
                className="hidden shrink-0 sm:inline-flex"
                onClick={() => void handleCheckIn()}
                disabled={checkInPending}
                variant={checkInError ? "destructive" : "default"}
              >
                {checkInLabel}
              </Button>
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
                          onClick={() => handleListMemberClick(member)}
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
