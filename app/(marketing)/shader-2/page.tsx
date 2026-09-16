import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { LandingHeroShader3 } from "@/components/landing/landing-hero-shader-3"
import { LandingPage } from "@/components/landing/landing-page"
import { getSessionUser } from "@/lib/auth/get-session-user"

export const metadata: Metadata = {
  title: "AWN — Shader 2",
  description:
    "The private network for touring professionals. By invitation only — every member is vetted by hand.",
}

export default async function Shader2LandingPage() {
  const user = await getSessionUser()
  if (user) {
    redirect("/now")
  }

  return <LandingPage shader={<LandingHeroShader3 />} />
}
