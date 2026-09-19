import { formatShortDate } from "@/lib/crew/format-profile-date"
import type { Person } from "@/lib/people-data"

export type ProfileDetailsRow = {
  label: string
  value: string
}

export function buildProfileDetailsRows(person: Person): ProfileDetailsRow[] {
  const rows: ProfileDetailsRow[] = []

  if (person.homeBase) {
    rows.push({ label: "Based", value: person.homeBase })
  }

  if (person.venueTiers.length > 0) {
    rows.push({
      label: "Scale",
      value: person.venueTiers.join(" · "),
    })
  }

  const regions = person.workAuth.filter((auth) => auth !== "Passport")
  if (regions.length > 0) {
    rows.push({
      label: "Regions",
      value: regions.join(" · "),
    })
  }

  if (person.availableFrom) {
    rows.push({
      label: "Next free",
      value: formatShortDate(person.availableFrom),
    })
  }

  if (person.workAuth.includes("Passport")) {
    rows.push({ label: "Travel", value: "Passport ready" })
  }

  return rows
}
