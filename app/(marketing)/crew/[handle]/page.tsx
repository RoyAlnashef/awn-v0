import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PublicCrewProfilePage } from "@/components/crew/public-crew-profile-page"
import { buildCrewProfileMetadata } from "@/lib/crew/metadata"
import { getPublicCrewProfile } from "@/lib/crew/public-profile"
import { getPublicSiteOrigin } from "@/lib/site-origin"

export const dynamic = "force-dynamic"

type PageProps = {
  params: Promise<{ handle: string }>
  searchParams: Promise<{ print?: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params
  const profile = await getPublicCrewProfile(handle)

  if (!profile) {
    return { title: "Profile not found | AWN" }
  }

  return buildCrewProfileMetadata(profile)
}

export default async function PublicCrewProfileRoute({
  params,
  searchParams,
}: PageProps) {
  const [{ handle }, query] = await Promise.all([params, searchParams])
  const profile = await getPublicCrewProfile(handle)

  if (!profile) {
    notFound()
  }

  const autoPrint = query.print === "resume"

  return (
    <PublicCrewProfilePage
      profile={profile}
      siteOrigin={getPublicSiteOrigin()}
      autoPrint={autoPrint}
    />
  )
}
