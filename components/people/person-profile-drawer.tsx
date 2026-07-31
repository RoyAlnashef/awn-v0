"use client"

import { useRef } from "react"
import { useRouter } from "next/navigation"

import { type Person, type TourCredit } from "@/lib/people-data"
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
}: {
  person: Person
  tourCredits?: TourCredit[]
  online?: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const router = useRouter()
  const heroRef = useRef<HTMLDivElement>(null)

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
        <DrawerTitle className="sr-only">{person.name} profile</DrawerTitle>
        <DrawerDescription className="sr-only">
          Extended profile for {person.name}, {person.role}.
        </DrawerDescription>

        <PersonProfileCard
          person={person}
          tourCredits={tourCredits}
          mode="interactive"
          online={online}
          heroRef={heroRef}
          onMessage={handleMessage}
          className="min-h-0 flex-1"
        />
      </DrawerContent>
    </Drawer>
  )
}
