"use client"

import Link from "next/link"
import { useCallback, useMemo } from "react"

import { landingContent } from "@/components/landing/content"
import { LandingFooter } from "@/components/landing/landing-footer"
import { LandingHeader } from "@/components/landing/landing-header"
import { PersonProfileCard } from "@/components/people/person-profile-card"
import { Button } from "@/components/ui/button"
import {
  buildCrewResumeData,
  type PublicCrewProfile,
} from "@/lib/crew/build-resume-data"

import { CrewAutoPrint } from "./crew-auto-print"
import { CrewResumeDocument } from "./crew-resume-document"

export function PublicCrewProfilePage({
  profile,
  siteOrigin,
  autoPrint = false,
}: {
  profile: PublicCrewProfile
  siteOrigin: string
  autoPrint?: boolean
}) {
  const { person, tourCredits } = profile
  const { hero } = landingContent

  const resumeData = useMemo(
    () => buildCrewResumeData(profile, siteOrigin),
    [profile, siteOrigin],
  )

  const handlePrint = useCallback(() => {
    window.setTimeout(() => {
      window.print()
    }, 100)
  }, [])

  return (
    <div className="relative flex min-h-svh flex-col">
      <div className="crew-screen-only flex min-h-svh flex-col">
        <LandingHeader />
        <main className="flex flex-1 flex-col px-6 py-10 sm:px-8">
          <div className="mx-auto w-full max-w-xl overflow-hidden rounded-xl border border-border bg-card shadow-lg">
            <PersonProfileCard
              mode="public"
              person={person}
              tourCredits={tourCredits}
              className="max-h-[min(80svh,900px)]"
              onPrintResume={handlePrint}
            />
          </div>
          <section className="mx-auto mt-10 flex w-full max-w-xl flex-col items-center gap-4 text-center">
            <p className="text-sm text-muted-foreground text-pretty">
              Interested in joining the network?
            </p>
            <Button
              size="lg"
              className="min-w-40"
              nativeButton={false}
              render={<Link href="/request-access" />}
            >
              {hero.primaryCta}
            </Button>
          </section>
        </main>
        <LandingFooter />
      </div>

      <CrewResumeDocument data={resumeData} />
      <CrewAutoPrint enabled={autoPrint} />
    </div>
  )
}
