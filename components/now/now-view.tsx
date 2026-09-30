"use client"

import * as React from "react"

import { ChooseGroupsCard } from "@/components/now/choose-groups-card"
import { GettingStartedCard } from "@/components/now/getting-started-card"
import { WhosAroundCard } from "@/components/now/whos-around-card"
import { HelpNowDialog } from "@/components/help-now/help-now-dialog"
import { HelpNowPageCallout } from "@/components/help-now/help-now-page-callout"
import { PageShell } from "@/components/page-shell"
import type { CheckInMapData } from "@/lib/now/check-in"
import type { OnboardingStatus } from "@/lib/onboarding/progress"
import { cn } from "@/lib/utils"

export function NowView({
  greeting,
  description,
  onboardingStatus,
  onboardingDismissed,
  checkInMapData,
}: {
  greeting: string
  description: string
  onboardingStatus: OnboardingStatus
  onboardingDismissed: boolean
  checkInMapData: CheckInMapData
}) {
  const [helpNowOpen, setHelpNowOpen] = React.useState(false)
  const [helpNowPosted, setHelpNowPosted] = React.useState(false)
  const [showGettingStarted, setShowGettingStarted] = React.useState(
    !onboardingDismissed,
  )

  const openHelpNow = React.useCallback(() => setHelpNowOpen(true), [])
  const handleHelpNowPosted = React.useCallback(
    () => setHelpNowPosted(true),
    [],
  )
  const handleGettingStartedVisibility = React.useCallback(
    (visible: boolean) => setShowGettingStarted(visible),
    [],
  )

  return (
    <>
      <PageShell
        title={greeting}
        description={description}
        actions={
          !helpNowPosted ? (
            <HelpNowPageCallout onOpen={openHelpNow} />
          ) : null
        }
      >
        <div
          className={cn(
            "grid min-h-min gap-4 lg:min-h-0 lg:items-start",
            showGettingStarted
              ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.25fr)]"
              : "lg:grid-cols-[minmax(0,1fr)_minmax(0,2.25fr)]",
          )}
        >
          <GettingStartedCard
            onOpenHelpNow={openHelpNow}
            onVisibilityChange={handleGettingStartedVisibility}
            initialStatus={onboardingStatus}
            initialDismissed={onboardingDismissed}
            helpNowPosted={helpNowPosted}
            className="order-1 lg:col-start-1 lg:row-start-1"
          />

          <ChooseGroupsCard
            className={cn(
              "order-2 lg:row-start-1",
              showGettingStarted ? "lg:col-start-2" : "lg:col-start-1",
            )}
          />

          <WhosAroundCard
            className={cn(
              "order-3 lg:row-start-1",
              showGettingStarted ? "lg:col-start-3" : "lg:col-start-2",
            )}
            initialMapData={checkInMapData}
          />
        </div>
      </PageShell>

      <HelpNowDialog
        open={helpNowOpen}
        onOpenChange={setHelpNowOpen}
        onPosted={handleHelpNowPosted}
      />
    </>
  )
}
