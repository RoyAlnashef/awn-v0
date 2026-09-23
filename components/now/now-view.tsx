"use client"

import * as React from "react"

import { ChooseGroupsCard } from "@/components/now/choose-groups-card"
import { GettingStartedCard } from "@/components/now/getting-started-card"
import { HelpNowBanner } from "@/components/now/help-now-banner"
import { WhosAroundCard } from "@/components/now/whos-around-card"
import { HelpNowDialog } from "@/components/help-now/help-now-dialog"
import { PageShell } from "@/components/page-shell"
import { Button } from "@/components/ui/button"
import { ButtonGroup } from "@/components/ui/button-group"
import { cn } from "@/lib/utils"

type NowLayout = "two-column" | "three-column"

export function NowView({
  greeting,
  description,
}: {
  greeting: string
  description: string
}) {
  const [layout, setLayout] = React.useState<NowLayout>("two-column")
  const [helpNowOpen, setHelpNowOpen] = React.useState(false)

  const openHelpNow = React.useCallback(() => setHelpNowOpen(true), [])

  return (
    <>
      <PageShell
        title={greeting}
        description={description}
        actions={
          <ButtonGroup aria-label="Now page layout">
            <Button
              type="button"
              size="sm"
              variant={layout === "two-column" ? "secondary" : "outline"}
              onClick={() => setLayout("two-column")}
              aria-pressed={layout === "two-column"}
            >
              Two-column
            </Button>
            <Button
              type="button"
              size="sm"
              variant={layout === "three-column" ? "secondary" : "outline"}
              onClick={() => setLayout("three-column")}
              aria-pressed={layout === "three-column"}
            >
              Three-column
            </Button>
          </ButtonGroup>
        }
      >
        <div
          className={cn(
            "grid gap-4",
            layout === "two-column"
              ? "lg:grid-cols-[380px_minmax(0,1fr)]"
              : "lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.25fr)]",
          )}
        >
          <HelpNowBanner
            onOpenHelpNow={openHelpNow}
            className={cn(
              layout === "two-column" ? "order-1 lg:hidden" : "hidden",
            )}
          />

          <GettingStartedCard
            onOpenHelpNow={openHelpNow}
            className={cn(
              layout === "two-column"
                ? "order-4 lg:order-none lg:col-start-1 lg:row-start-2"
                : "order-1 lg:order-none lg:col-start-1 lg:row-start-1",
            )}
          />

          <ChooseGroupsCard
            className={cn(
              layout === "two-column"
                ? "order-2 lg:order-none lg:col-start-1 lg:row-start-1"
                : "order-2 lg:order-none lg:col-start-2 lg:row-start-1",
            )}
          />

          <WhosAroundCard
            className={cn(
              layout === "two-column"
                ? "order-3 lg:order-none lg:col-start-2 lg:row-start-1 lg:row-span-2"
                : "order-3 lg:order-none lg:col-start-3 lg:row-start-1",
            )}
          />
        </div>
      </PageShell>

      <HelpNowDialog open={helpNowOpen} onOpenChange={setHelpNowOpen} />
    </>
  )
}
