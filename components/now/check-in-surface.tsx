"use client"

import * as React from "react"
import {
  List,
  Map as MapIcon,
  MapPin,
  Maximize2,
  Search,
  X,
} from "lucide-react"

import { BoardViewToggle } from "@/components/board-view-toggle"
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

export type CheckInViewMode = "map" | "list"

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
  viewMode: CheckInViewMode
  onViewModeChange: (mode: CheckInViewMode) => void
  selectedMemberId: string | null
  onSelectMember: (memberId: string | null) => void
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
  onListMemberClick: (member: CheckedInMember) => void
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
  viewMode,
  onViewModeChange,
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
  onListMemberClick,
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

  const listMembers = React.useMemo(
    () =>
      [...mapData.members]
        .filter((member) => !member.isSelf)
        .sort((a, b) => a.person.name.localeCompare(b.person.name)),
    [mapData.members],
  )

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
        {viewMode === "map" || !isCheckedIn ? (
          mapSlot
        ) : (
          <div className="absolute inset-0 overflow-y-auto bg-background/95 p-4 pt-16 sm:p-6 sm:pt-18">
            <p className="mb-4 text-sm text-muted-foreground">
              {mapData.checkedInCount} checked in nearby
            </p>
            <ul className="divide-y divide-border">
              {listMembers.map((member) => (
                <li key={member.person.id}>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 py-3 text-left text-sm transition-colors hover:bg-muted/40"
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
                      <span className="font-medium">{member.person.name}</span>
                      {member.city ? (
                        <span className="text-muted-foreground">
                          {" "}
                          · {member.city}
                        </span>
                      ) : null}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 flex flex-col justify-between p-3 sm:p-4">
          <div className="pointer-events-auto flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div ref={headerAnchorRef} className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
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
                  <InputGroup className="max-w-md border-border bg-background/90 backdrop-blur-sm">
                    <InputGroupAddon align="inline-start">
                      <Search className="size-4" />
                    </InputGroupAddon>
                    <InputGroupInput
                      value={searchQuery}
                      onChange={(event) =>
                        onSearchQueryChange(event.target.value)
                      }
                      placeholder="Search city, venue or crew…"
                      aria-label="Search city, venue or crew"
                    />
                    <InputGroupAddon align="inline-end">
                      {showLocatedChrome ? (
                        <InputGroupButton
                          size="icon-xs"
                          aria-label="Clear search"
                          onClick={onClearSearch}
                        >
                          <X />
                        </InputGroupButton>
                      ) : (
                        <InputGroupButton
                          size="icon-xs"
                          aria-label="Use current location"
                          disabled={locatePending}
                          onClick={() => void onLocate()}
                        >
                          <MapPin />
                        </InputGroupButton>
                      )}
                    </InputGroupAddon>
                  </InputGroup>
                  {showHeaderCheckInButton ? (
                    <Button
                      type="button"
                      onClick={onPrimaryCheckIn}
                      disabled={locatePending}
                    >
                      Check In
                    </Button>
                  ) : null}
                </>
              )}
            </div>

            {isCheckedIn ? (
              <div className="flex shrink-0 items-center gap-2 self-end sm:self-auto">
                <BoardViewToggle
                  view={viewMode}
                  onViewChange={onViewModeChange}
                  options={[
                    {
                      value: "map",
                      ariaLabel: "Map view",
                      icon: <MapIcon />,
                    },
                    {
                      value: "list",
                      ariaLabel: "List view",
                      icon: <List />,
                    },
                  ]}
                />
              </div>
            ) : null}
          </div>

          <div
            className={cn(
              "pointer-events-auto flex w-full items-end gap-2",
              viewMode === "map" || !isCheckedIn
                ? "justify-between"
                : "justify-end",
            )}
          >
            {viewMode === "map" || !isCheckedIn ? (
              <div className="inline-flex rounded-full border border-border/80 bg-background/90 px-3 py-1.5 text-sm text-muted-foreground backdrop-blur-sm">
                {mapData.checkedInCount} checked in nearby
              </div>
            ) : null}
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
            onMemberClick={onListMemberClick}
          />
        </>
      ) : null}
    </div>
  )
}

export function CheckInListDrawer({
  person,
  onClose,
}: {
  person: Person | null
  onClose: () => void
}) {
  if (!person) return null
  return (
    <PersonProfileDrawer
      person={person}
      open={Boolean(person)}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    />
  )
}
