import { getCrewProfilePath } from "@/lib/account/handle"
import { getPersonProfile } from "@/lib/people-data"
import type { Person, TourCredit, WorkAuth } from "@/lib/people-data"
import { getPersonSocialLinks } from "@/lib/social-links"

export type PublicCrewProfile = {
  person: Person
  tourCredits: TourCredit[]
  handle: string
}

export type CrewResumeData = {
  handle: string
  profileUrl: string
  person: Person
  tourCredits: TourCredit[]
  bio: string
  competencies: string[]
  socialLinks: ReturnType<typeof getPersonSocialLinks>
  workAuth: WorkAuth[]
  yearsExperience: number
  venueTiers: Person["venueTiers"]
  department: string
}

export function buildCrewResumeData(
  profile: PublicCrewProfile,
  siteOrigin: string,
): CrewResumeData {
  const { person, tourCredits, handle } = profile
  const personProfile = getPersonProfile(person, tourCredits)

  return {
    handle,
    profileUrl: `${siteOrigin}${getCrewProfilePath(handle)}`,
    person,
    tourCredits,
    bio: personProfile.bio,
    competencies: person.skills.length > 0 ? person.skills : [person.department],
    socialLinks: getPersonSocialLinks(person),
    workAuth: person.workAuth,
    yearsExperience: person.yearsExperience,
    venueTiers: person.venueTiers,
    department: person.department,
  }
}
