"use client"

import { useState } from "react"
import { Contact, ExternalLink } from "lucide-react"

import { toProfileTourCredits } from "@/lib/account-profile"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAccountProfile } from "@/components/account/account-profile-provider"
import { PersonProfileDrawer } from "@/components/people/person-profile-drawer"

export function AccountPageActions() {
  const { draft, tourCredits, online } = useAccountProfile()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <TooltipProvider delay={400}>
      <div className="flex flex-wrap items-center gap-2">
        <Tooltip>
          <TooltipTrigger
            render={
              <span className="inline-flex">
                <Button variant="outline" disabled>
                  <ExternalLink />
                  My Profile
                </Button>
              </span>
            }
          />
          <TooltipContent>Public profile page coming soon</TooltipContent>
        </Tooltip>

        <Button
          variant="outline"
          className="lg:hidden"
          onClick={() => setDrawerOpen(true)}
        >
          <Contact />
          Profile Card
        </Button>
      </div>

      <PersonProfileDrawer
        person={draft}
        tourCredits={toProfileTourCredits(tourCredits)}
        online={online}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </TooltipProvider>
  )
}
