"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

import { useRouter } from "next/navigation"

import { isProfileShellPerson } from "@/lib/people/fallback-person"
import { type Person, type TourCredit } from "@/lib/people-data"
import { getMemberById } from "@/lib/people/actions"
import {
  FLYOUT_DRAWER_CONTENT_CLASS,
  FlyoutDrawerClose,
} from "@/components/messages/flyout-drawer"
import { useMessages } from "@/components/messages/messages-provider"
import { PersonProfileCard } from "@/components/people/person-profile-card"
import { PersonProfileCardSkeleton } from "@/components/people/person-profile-card-skeleton"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer"

export function PersonProfileDrawer({
  person,
  tourCredits,
  online,
  open,
  onOpenChange,
  footer,
  modal = true,
}: {
  person: Person
  tourCredits?: TourCredit[]
  online?: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  footer?: ReactNode
  /** False when nested in an existing overlay (e.g. check-in dialog). */
  modal?: boolean
}) {
  const router = useRouter()
  const { currentUser } = useMessages()
  const heroRef = useRef<HTMLDivElement>(null)
  const [resolvedPerson, setResolvedPerson] = useState(person)
  const [resolvedTourCredits, setResolvedTourCredits] = useState<TourCredit[]>(
    tourCredits ?? [],
  )
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const profileFetchIdRef = useRef(0)

  useEffect(() => {
    setResolvedPerson(person)
    // Only sync from props when explicitly provided — avoids wiping credits
    // fetched by getMemberById when parent re-renders after revalidatePath.
    if (tourCredits !== undefined) {
      setResolvedTourCredits(tourCredits)
    }
  }, [person, tourCredits])

  useEffect(() => {
    if (!open) {
      setIsProfileLoading(false)
      return
    }

    const showSkeleton = isProfileShellPerson(person)
    setIsProfileLoading(showSkeleton)

    const fetchId = ++profileFetchIdRef.current

    void getMemberById(person.id).then((result) => {
      if (fetchId !== profileFetchIdRef.current) return
      setIsProfileLoading(false)
      if (!result.ok) return
      setResolvedPerson(result.person)
      setResolvedTourCredits(result.tourCredits)
    })
  }, [open, person.id, person])

  function handleMessage() {
    onOpenChange(false)
    router.push(`/messages?person=${person.id}`)
  }

  return (
    <Drawer
      open={open}
      onOpenChange={onOpenChange}
      swipeDirection="right"
      modal={modal}
    >
      <DrawerContent
        initialFocus={heroRef}
        className={FLYOUT_DRAWER_CONTENT_CLASS}
      >
        <FlyoutDrawerClose />
        <DrawerTitle className="sr-only">{resolvedPerson.name} profile</DrawerTitle>
        <DrawerDescription className="sr-only">
          Extended profile for {resolvedPerson.name}, {resolvedPerson.role}.
        </DrawerDescription>

        {isProfileLoading ? (
          <PersonProfileCardSkeleton
            heroRef={heroRef}
            reserveTopRightForClose
            className="min-h-0 flex-1"
          />
        ) : (
          <PersonProfileCard
            person={resolvedPerson}
            tourCredits={resolvedTourCredits}
            mode="interactive"
            online={online}
            heroRef={heroRef}
            onMessage={handleMessage}
            footer={footer}
            viewerProfileId={currentUser.id}
            reserveTopRightForClose
            className="min-h-0 flex-1"
          />
        )}
      </DrawerContent>
    </Drawer>
  )
}
