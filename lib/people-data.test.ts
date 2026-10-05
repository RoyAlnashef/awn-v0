import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { getPersonProfile, type Person } from "./people-data.ts"

function minimalPerson(overrides: Partial<Person> = {}): Person {
  return {
    id: "1",
    name: "Aubrey Wright",
    role: "",
    department: "",
    homeBase: "",
    city: "",
    availability: "Available Now",
    availableFrom: "",
    availableTo: "",
    venueTiers: [],
    workAuth: [],
    yearsExperience: 0,
    credits: 0,
    vouches: 0,
    topTours: [],
    skills: [],
    followed: false,
    ...overrides,
  }
}

describe("getPersonProfile", () => {
  it("does not synthesize bio when bio is missing", () => {
    const profile = getPersonProfile(minimalPerson())
    assert.equal(profile.bio, undefined)
  })

  it("returns trimmed member bio when provided", () => {
    const profile = getPersonProfile(
      minimalPerson({ bio: "  Tour manager for arena runs.  " }),
    )
    assert.equal(profile.bio, "Tour manager for arena runs.")
  })
})
