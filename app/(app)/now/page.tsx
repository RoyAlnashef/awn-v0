import { cookies } from "next/headers"

import { NowView } from "@/components/now/now-view"
import { getSessionUser } from "@/lib/auth/get-session-user"
import { getCheckInMapData } from "@/lib/now/check-in"
import {
  firstNameFromFullName,
  resolveServerNowGreeting,
  TIMEZONE_COOKIE_NAME,
} from "@/lib/now/greeting"
import { mainNav } from "@/lib/nav"
import { getOnboardingSignals } from "@/lib/onboarding/progress"

const now = mainNav.find((item) => item.href === "/now")!

export default async function NowPage() {
  const [sessionUser, onboarding, checkInMapData] = await Promise.all([
    getSessionUser(),
    getOnboardingSignals(),
    getCheckInMapData(),
  ])
  const firstName = firstNameFromFullName(sessionUser?.name ?? "Member")
  const cookieStore = await cookies()
  const timeZoneCookie = cookieStore.get(TIMEZONE_COOKIE_NAME)?.value
  const timeZone = timeZoneCookie
    ? decodeURIComponent(timeZoneCookie)
    : undefined
  const greeting = resolveServerNowGreeting(firstName, timeZone)

  return (
    <NowView
      firstName={firstName}
      greeting={greeting}
      description={now.description}
      onboardingStatus={onboarding.status}
      onboardingDismissed={onboarding.dismissed}
      checkInMapData={checkInMapData}
    />
  )
}
