import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { LandingPageWithShader } from "@/components/landing/landing-page-with-shader"
import { getSessionUser } from "@/lib/auth/get-session-user"

export const metadata: Metadata = {
  title: "AWN — Shader Preview",
  description:
    "The private network for touring professionals. By invitation only — every member is vetted by hand.",
}

export default async function ShaderHomePage() {
  const user = await getSessionUser()
  if (user) {
    redirect("/now")
  }

  return <LandingPageWithShader />
}
