import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { LandingHeroOrb14 } from "@/components/landing/landing-hero-orb-14"
import { LandingPage } from "@/components/landing/landing-page"
import { getSessionUser } from "@/lib/auth/get-session-user"

export const metadata: Metadata = {
  title: "AWN — Orb 14",
  description:
    "The private network for touring professionals. By invitation only — every member is vetted by hand.",
}

export default async function Orb14ShaderPage() {
  const user = await getSessionUser()
  if (user) {
    redirect("/now")
  }

  return <LandingPage shader={<LandingHeroOrb14 />} />
}
