"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

import { useRouter } from "next/navigation"

import { type Person, type TourCredit } from "@/lib/people-data"
import { getMemberById } from "@/lib/people/actions"
import {
  FLYOUT_DRAWER_CONTENT_CLASS,
  FlyoutDrawerClose,
} from "@/components/messages/flyout-drawer"
import { PersonProfileCard } from "@/components/people/person-profile-card"
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
}: {
  person: Person
  tourCredits?: TourCredit[]
  online?: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
  footer?: ReactNode
}) {
  const router = useRouter()
  const heroRef = useRef<HTMLDivElement>(null)
  const [resolvedPerson, setResolvedPerson] = useState(person)
  const [resolvedTourCredits, setResolvedTourCredits] = useState<TourCredit[]>(
    tourCredits ?? [],
  )

  useEffect(() => {
    setResolvedPerson(person)
    // Only sync from props when explicitly provided — avoids wiping credits
    // fetched by getMemberById when parent re-renders after revalidatePath.
    if (tourCredits !== undefined) {
      setResolvedTourCredits(tourCredits)
    }
  }, [person, tourCredits])

  useEffect(() => {
    if (!open) return

    void getMemberById(person.id).then((result) => {
      if (!result.ok) return
      setResolvedPerson(result.person)
      setResolvedTourCredits(result.tourCredits)
    })
  }, [open, person.id])

  function handleMessage() {
    onOpenChange(false)
    router.push(`/messages?person=${person.id}`)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
      <DrawerContent
        initialFocus={heroRef}
        className={FLYOUT_DRAWER_CONTENT_CLASS}
      >
        <FlyoutDrawerClose />
        <DrawerTitle className="sr-only">{resolvedPerson.name} profile</DrawerTitle>
        <DrawerDescription className="sr-only">
          Extended profile for {resolvedPerson.name}, {resolvedPerson.role}.
        </DrawerDescription>

        <PersonProfileCard
          person={resolvedPerson}
          tourCredits={resolvedTourCredits}
          mode="interactive"
          online={online}
          heroRef={heroRef}
          onMessage={handleMessage}
          footer={footer}
          reserveTopRightForClose
          className="min-h-0 flex-1"
        />
      </DrawerContent>
    </Drawer>
  )
}
