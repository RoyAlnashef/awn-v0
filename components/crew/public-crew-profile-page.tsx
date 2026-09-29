"use client"

import Link from "next/link"
import { useCallback, useMemo } from "react"

import { CrewProfileBio } from "@/components/crew/crew-profile-bio"
import { CrewProfileCredits } from "@/components/crew/crew-profile-credits"
import {
  CrewProfileDetailsMobile,
  CrewProfileDetailsSidebar,
  CrewProfileSocialMobile,
} from "@/components/crew/crew-profile-details"
import { CrewProfileHero } from "@/components/crew/crew-profile-hero"
import { CrewProfileSkills } from "@/components/crew/crew-profile-skills"
import { CrewResumeButton } from "@/components/crew/crew-resume-button"
import { landingContent } from "@/components/landing/content"
import { LandingFooter } from "@/components/landing/landing-footer"
import { LandingHeader } from "@/components/landing/landing-header"
import { Button } from "@/components/ui/button"
import {
  buildCrewResumeData,
  type PublicCrewProfile,
} from "@/lib/crew/build-resume-data"
import { getPersonProfile } from "@/lib/people-data"

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
  const personProfile = getPersonProfile(person, tourCredits)

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
        <main className="flex flex-1 flex-col">
          <div className="relative">
            <div className="absolute inset-x-0 top-0 z-20">
              <LandingHeader />
            </div>
            <CrewProfileHero
              person={person}
              tourCredits={tourCredits}
              onPrintResume={handlePrint}
            />
          </div>

          <div className="mx-auto w-full max-w-6xl flex-1 px-6 pb-10 sm:px-8">
            {person.handle ? (
              <div className="mb-8 mt-2 lg:hidden">
                <CrewResumeButton onPrintResume={handlePrint} fullWidth />
              </div>
            ) : null}

            <div className="flex flex-col gap-8 lg:grid lg:grid-cols-[1fr_280px] lg:items-start lg:gap-12">
              <div className="flex flex-col gap-8 lg:gap-10">
                <div className="flex flex-col gap-8 lg:hidden">
                  <CrewProfileSocialMobile person={person} />
                </div>

                {personProfile.bio ? (
                  <CrewProfileBio bio={personProfile.bio} />
                ) : null}

                <CrewProfileCredits credits={tourCredits} />

                <div className="lg:hidden">
                  <CrewProfileDetailsMobile person={person} />
                </div>

                <CrewProfileSkills skills={person.skills} />
              </div>

              <div className="hidden lg:block">
                <CrewProfileDetailsSidebar person={person} />
              </div>
            </div>

            <section className="mx-auto mt-12 flex w-full max-w-xl flex-col items-center gap-4 text-center">
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
          </div>
        </main>

        <LandingFooter />
      </div>

      <CrewResumeDocument data={resumeData} />
      <CrewAutoPrint enabled={autoPrint} />
    </div>
  )
}
