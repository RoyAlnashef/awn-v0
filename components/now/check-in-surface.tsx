"use client"

import * as React from "react"
import { MapPin, Maximize2, Search, X } from "lucide-react"

import { CheckInBundlePopover } from "@/components/now/check-in-bundle-popover"
import { CheckInFormPopover } from "@/components/now/check-in-form-popover"
import { PersonProfileDrawer } from "@/components/people/person-profile-drawer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import type { CheckInMapData, CheckedInMember } from "@/lib/now/check-in"
import {
  deriveCheckInPhase,
  hoursLeftFromCheckedInAt,
} from "@/lib/now/check-in-ui"
import { initials } from "@/lib/people-data"
import type { Person } from "@/lib/people-data"
import { cn } from "@/lib/utils"

export type CheckInSurfaceVariant = "inline" | "expanded"

type CheckInSurfaceProps = {
  variant: CheckInSurfaceVariant
  mapData: CheckInMapData
  searchQuery: string
  onSearchQueryChange: (value: string) => void
  editLocationQuery: string
  onEditLocationQueryChange: (value: string) => void
  draftNote: string
  onDraftNoteChange: (value: string) => void
  checkInPopoverOpen: boolean
  onCheckInPopoverOpenChange: (open: boolean) => void
  editPopoverOpen: boolean
  onEditPopoverOpenChange: (open: boolean) => void
  bundlePopoverOpen: boolean
  onBundlePopoverOpenChange: (open: boolean) => void
  bundleMembers: CheckedInMember[]
  bundleCityLabel: string
  mapResizeWhen?: boolean | number
  locatePending: boolean
  submitPending: boolean
  submitError: string | null
  onLocate: () => void
  onClearSearch: () => void
  onPrimaryCheckIn: () => void
  onSubmitCheckIn: () => void
  onSubmitEdit: () => void
  onClearCheckIn: () => void
  onOpenEdit: () => void
  onBundleMemberClick: (member: CheckedInMember) => void
  onExpand?: () => void
  /** When false, skip anchored popovers (avoids duplicates if another surface owns them). */
  mountPopovers?: boolean
  mapSlot: React.ReactNode
}

export function CheckInSurface({
  variant,
  mapData,
  searchQuery,
  onSearchQueryChange,
  editLocationQuery,
  onEditLocationQueryChange,
  draftNote,
  onDraftNoteChange,
  checkInPopoverOpen,
  onCheckInPopoverOpenChange,
  editPopoverOpen,
  onEditPopoverOpenChange,
  bundlePopoverOpen,
  onBundlePopoverOpenChange,
  bundleMembers,
  bundleCityLabel,
  locatePending,
  submitPending,
  submitError,
  onLocate,
  onClearSearch,
  onPrimaryCheckIn,
  onSubmitCheckIn,
  onSubmitEdit,
  onClearCheckIn,
  onOpenEdit,
  onBundleMemberClick,
  onExpand,
  mountPopovers = true,
  mapSlot,
}: CheckInSurfaceProps) {
  const isInline = variant === "inline"
  const headerAnchorRef = React.useRef<HTMLDivElement>(null)
  const isCheckedIn = Boolean(mapData.ownCheckIn)
  const phase = deriveCheckInPhase({
    isCheckedIn,
    searchQuery,
    checkInPopoverOpen,
    editPopoverOpen,
  })
  const showLocatedChrome = phase === "located" || phase === "checkingIn"
  const showHeaderCheckInButton = phase === "located"
  const selfMember = mapData.members.find((member) => member.isSelf)

  const hoursLeft = mapData.ownCheckIn
    ? hoursLeftFromCheckedInAt(mapData.ownCheckIn.checkedInAt)
    : 0

  const placeLabel =
    mapData.ownCheckIn?.city ??
    (searchQuery.trim() || mapData.cityLabel)

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
        {mapSlot}

        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 sm:p-4">
          <div
            className={cn(
              "pointer-events-auto flex w-full flex-col gap-2 sm:flex-row sm:items-start sm:justify-between",
              !isInline && "pe-11 sm:pe-12",
            )}
          >
            <div
              ref={headerAnchorRef}
              className="flex w-full min-w-0 flex-1 flex-wrap items-center gap-2"
            >
              {isCheckedIn ? (
                <>
                  <div className="flex max-w-full items-center gap-2 rounded-full border border-border bg-background/90 py-1 pr-3 pl-1 backdrop-blur-sm">
                    <Avatar
                      className="size-8 border-2 border-chart-2 ring-2 ring-chart-2/20"
                    >
                      <AvatarImage
                        src={selfMember?.person.avatar || undefined}
                        alt=""
                      />
                      <AvatarFallback className="text-xs font-medium">
                        {initials(selfMember?.person.name ?? "You")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate text-sm font-medium">
                      {mapData.ownCheckIn?.city ?? mapData.cityLabel} · {hoursLeft}
                      h left
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="border-border bg-background/90 backdrop-blur-sm"
                    onClick={onOpenEdit}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => void onClearCheckIn()}
                    disabled={submitPending}
                  >
                    Clear
                  </Button>
                </>
              ) : (
                <>
                  <InputGroup className="h-12 w-full min-w-0 border-border bg-background/90 backdrop-blur-sm">
                    <InputGroupAddon align="inline-start" className="pl-3.5">
                      <Search className="size-5" />
                    </InputGroupAddon>
                    <InputGroupInput
                      className="h-full text-base md:text-base"
                      value={searchQuery}
                      onChange={(event) =>
                        onSearchQueryChange(event.target.value)
                      }
                      placeholder="Type in a location"
                      aria-label="Type in a location"
                    />
                    <InputGroupAddon align="inline-end" className="gap-1.5 pr-2">
                      {showHeaderCheckInButton ? (
                        <InputGroupButton
                          variant="default"
                          className="h-8 px-3 text-sm font-medium"
                          disabled={locatePending}
                          onClick={onPrimaryCheckIn}
                        >
                          Check In
                        </InputGroupButton>
                      ) : null}
                      {showLocatedChrome ? (
                        <InputGroupButton
                          size="icon-sm"
                          aria-label="Clear search"
                          onClick={onClearSearch}
                        >
                          <X className="size-4" />
                        </InputGroupButton>
                      ) : (
                        <InputGroupButton
                          size="icon-sm"
                          aria-label="Use current location"
                          disabled={locatePending}
                          onClick={() => void onLocate()}
                        >
                          <MapPin className="size-4" />
                        </InputGroupButton>
                      )}
                    </InputGroupAddon>
                  </InputGroup>
                </>
              )}
            </div>
          </div>

          <div className="pointer-events-auto flex w-full items-end justify-between gap-2">
            <div className="inline-flex rounded-full border border-border/80 bg-background/90 px-3 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
              {mapData.checkedInCount} checked in nearby
            </div>
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
      </div>

      {mountPopovers ? (
        <>
          <CheckInFormPopover
            mode="check-in"
            open={checkInPopoverOpen}
            onOpenChange={onCheckInPopoverOpenChange}
            anchor={headerAnchorRef}
            placeLabel={placeLabel}
            locationQuery={searchQuery}
            onLocationQueryChange={onSearchQueryChange}
            note={draftNote}
            onNoteChange={onDraftNoteChange}
            pending={submitPending}
            error={submitError}
            onSubmit={onSubmitCheckIn}
          />

          <CheckInFormPopover
            mode="edit"
            open={editPopoverOpen}
            onOpenChange={onEditPopoverOpenChange}
            anchor={headerAnchorRef}
            placeLabel={placeLabel}
            locationQuery={editLocationQuery}
            onLocationQueryChange={onEditLocationQueryChange}
            note={draftNote}
            onNoteChange={onDraftNoteChange}
            pending={submitPending}
            error={submitError}
            onSubmit={onSubmitEdit}
          />

          <CheckInBundlePopover
            open={bundlePopoverOpen}
            onOpenChange={onBundlePopoverOpenChange}
            anchor={headerAnchorRef}
            cityLabel={bundleCityLabel}
            members={bundleMembers}
            onMemberClick={onBundleMemberClick}
          />
        </>
      ) : null}
    </div>
  )
}

const PROFILE_DRAWER_CLOSE_MS = 450

export function CheckInListDrawer({
  person,
  onClose,
  modal = true,
}: {
  person: Person | null
  onClose: () => void
  modal?: boolean
}) {
  const [activePerson, setActivePerson] = React.useState<Person | null>(null)
  const [open, setOpen] = React.useState(false)
  const closeTimerRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    if (!person) return

    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }

    setActivePerson(person)
    setOpen(false)
    const frame = window.requestAnimationFrame(() => {
      setOpen(true)
    })
    return () => window.cancelAnimationFrame(frame)
  }, [person])

  if (!activePerson) return null

  return (
    <PersonProfileDrawer
      person={activePerson}
      open={open}
      modal={modal}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen)
        if (nextOpen) return

        closeTimerRef.current = window.setTimeout(() => {
          setActivePerson(null)
          onClose()
          closeTimerRef.current = null
        }, PROFILE_DRAWER_CLOSE_MS)
      }}
    />
  )
}
