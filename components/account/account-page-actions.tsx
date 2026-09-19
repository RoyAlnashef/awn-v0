"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Contact, ExternalLink } from "lucide-react"

import { getCrewProfilePath } from "@/lib/account/handle"
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

const PROFILE_TAB_PATH = "/account/profile"

export function AccountPageActions() {
  const pathname = usePathname()
  const {
    draft,
    tourCredits,
    online,
    hasDraftChanges,
    isSaving,
    resetDraft,
    saveDraft,
  } = useAccountProfile()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const profileHref = draft.handle ? getCrewProfilePath(draft.handle) : null
  const isProfileTab = pathname === PROFILE_TAB_PATH

  return (
    <TooltipProvider delay={400}>
      <div className="flex flex-wrap items-center gap-2">
        {isProfileTab && hasDraftChanges ? (
          <>
            <Button
              size="sm"
              variant="ghost"
              type="button"
              onClick={resetDraft}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              type="button"
              onClick={saveDraft}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </>
        ) : null}

        {profileHref ? (
          <Button
            variant="outline"
            nativeButton={false}
            render={
              <Link
                href={profileHref}
                target="_blank"
                rel="noopener noreferrer"
              />
            }
          >
            <ExternalLink />
            My Profile
          </Button>
        ) : (
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
            <TooltipContent>Profile URL unavailable</TooltipContent>
          </Tooltip>
        )}

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
