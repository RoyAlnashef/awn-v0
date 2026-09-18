import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { PublicCrewProfilePage } from "@/components/crew/public-crew-profile-page"
import { getPublicCrewProfile } from "@/lib/crew/public-profile"

type PageProps = {
  params: Promise<{ handle: string }>
  searchParams: Promise<{ print?: string }>
}

function siteOrigin(): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  if (base) return base.replace(/\/$/, "")
  return "https://awn.network"
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { handle } = await params
  const profile = await getPublicCrewProfile(handle)

  if (!profile) {
    return { title: "Profile not found | AWN" }
  }

  const { person } = profile
  const description =
    person.bio?.slice(0, 160) ||
    `${person.name}${person.role ? ` — ${person.role}` : ""} on AWN.`

  return {
    title: `${person.name} | AWN`,
    description,
    openGraph: {
      title: `${person.name} | AWN`,
      description,
      type: "profile",
      ...(person.avatar ? { images: [{ url: person.avatar }] } : {}),
    },
  }
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
      siteOrigin={siteOrigin()}
      autoPrint={autoPrint}
    />
  )
}
