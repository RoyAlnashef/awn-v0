import type { Metadata } from "next"

import { getCrewProfilePath } from "@/lib/account/handle"
import type { PublicCrewProfile } from "@/lib/crew/build-resume-data"
import { getPublicSiteOrigin } from "@/lib/site-origin"

function cacheBustUrl(url: string, updatedAt: string): string {
  const version = Date.parse(updatedAt)
  if (Number.isNaN(version)) {
    return url
  }

  const separator = url.includes("?") ? "&" : "?"
  return `${url}${separator}v=${version}`
}

function buildDescription(profile: PublicCrewProfile): string {
  const { person } = profile

  return (
    person.bio?.slice(0, 160) ||
    `${person.name}${person.role ? ` — ${person.role}` : ""} on AWN.`
  )
}

export function buildCrewProfileMetadata(profile: PublicCrewProfile): Metadata {
  const { person, handle, updatedAt } = profile
  const description = buildDescription(profile)
  const siteOrigin = getPublicSiteOrigin()
  const canonicalPath = getCrewProfilePath(handle)
  const canonicalUrl = `${siteOrigin}${canonicalPath}`
  const images = person.avatar
    ? [{ url: cacheBustUrl(person.avatar, updatedAt) }]
    : undefined

  return {
    title: `${person.name} | AWN`,
    description,
    metadataBase: new URL(siteOrigin),
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      title: `${person.name} | AWN`,
      description,
      type: "profile",
      url: canonicalUrl,
      ...(images ? { images } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: `${person.name} | AWN`,
      description,
      ...(images ? { images: images.map((image) => image.url) } : {}),
    },
  }
}
