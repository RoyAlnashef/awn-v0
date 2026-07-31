"use client"

import { useState } from "react"
import { Contact, ExternalLink } from "lucide-react"

import { people } from "@/lib/people-data"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { PersonProfileDrawer } from "@/components/people/person-profile-drawer"

const MOCK_ACCOUNT_PERSON = people[0]

export function AccountPageActions() {
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

        <Button variant="outline" onClick={() => setDrawerOpen(true)}>
          <Contact />
          Contact Card
        </Button>
      </div>

      <PersonProfileDrawer
        person={MOCK_ACCOUNT_PERSON}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      />
    </TooltipProvider>
  )
}
