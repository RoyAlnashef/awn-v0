import { getCrewProfilePath } from "@/lib/account/handle"
import { buildProfileDetailsRows } from "@/lib/crew/profile-details-rows"
import type { ProfileDetailsRow } from "@/lib/crew/profile-details-rows"
import { getPersonProfile } from "@/lib/people-data"
import type { Person, TourCredit } from "@/lib/people-data"

export type PublicCrewProfile = {
  person: Person
  tourCredits: TourCredit[]
  handle: string
  updatedAt: string
}

export type CrewResumeData = {
  handle: string
  profileUrl: string
  displayProfileUrl: string
  person: Person
  tourCredits: TourCredit[]
  bio: string
  detailsRows: ProfileDetailsRow[]
}

export function buildCrewResumeData(
  profile: PublicCrewProfile,
  siteOrigin: string,
): CrewResumeData {
  const { person, tourCredits, handle } = profile
  const personProfile = getPersonProfile(person, tourCredits)

  const profileUrl = `${siteOrigin}${getCrewProfilePath(handle)}`

  return {
    handle,
    profileUrl,
    displayProfileUrl: profileUrl.replace(/^https?:\/\//, ""),
    person,
    tourCredits,
    bio: personProfile.bio,
    detailsRows: buildProfileDetailsRows(person),
  }
}
