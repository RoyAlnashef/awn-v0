import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { LandingPage } from "@/components/landing/landing-page"
import { getSessionUser } from "@/lib/auth/get-session-user"

export const metadata: Metadata = {
  title: "AWN — A Wright Network",
  description:
    "The private network for touring professionals. By invitation only — every member is vetted by hand.",
}

export default async function MarketingHomePage() {
  const user = await getSessionUser()
  if (user) {
    redirect("/now")
  }

  return <LandingPage />
}
