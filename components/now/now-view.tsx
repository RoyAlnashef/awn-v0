"use client"

import * as React from "react"

import { ChooseGroupsCard } from "@/components/now/choose-groups-card"
import { GettingStartedCard } from "@/components/now/getting-started-card"
import { WhosAroundCard } from "@/components/now/whos-around-card"
import { HelpNowDialog } from "@/components/help-now/help-now-dialog"
import { PageShell } from "@/components/page-shell"
import type { OnboardingStatus } from "@/lib/onboarding/progress"

export function NowView({
  greeting,
  description,
  onboardingStatus,
  onboardingDismissed,
}: {
  greeting: string
  description: string
  onboardingStatus: OnboardingStatus
  onboardingDismissed: boolean
}) {
  const [helpNowOpen, setHelpNowOpen] = React.useState(false)
  const [helpNowPosted, setHelpNowPosted] = React.useState(false)

  const openHelpNow = React.useCallback(() => setHelpNowOpen(true), [])
  const handleHelpNowPosted = React.useCallback(
    () => setHelpNowPosted(true),
    [],
  )

  return (
    <>
      <PageShell title={greeting} description={description}>
        <div className="grid min-h-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.25fr)] lg:items-start">
          <GettingStartedCard
            onOpenHelpNow={openHelpNow}
            initialStatus={onboardingStatus}
            initialDismissed={onboardingDismissed}
            helpNowPosted={helpNowPosted}
            className="order-1 lg:col-start-1 lg:row-start-1"
          />

          <ChooseGroupsCard className="order-2 lg:col-start-2 lg:row-start-1" />

          <WhosAroundCard className="order-3 lg:col-start-3 lg:row-start-1" />
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
