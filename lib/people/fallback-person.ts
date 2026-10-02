import type { DirectConversation, ThreadMessage } from "@/lib/messages-data"
import type { Person } from "@/lib/people-data"

/**
 * True when `person` matches the minimal shell from the factories below
 * (before `getMemberById`). Keep field checks in sync if those stubs change.
 */
export function isProfileShellPerson(person: Person): boolean {
  return (
    person.department === "" &&
    person.homeBase === "" &&
    person.city === "" &&
    person.availableFrom === "" &&
    person.availableTo === "" &&
    person.venueTiers.length === 0 &&
    person.workAuth.length === 0 &&
    person.yearsExperience === 0 &&
    person.credits === 0 &&
    person.vouches === 0 &&
    person.topTours.length === 0 &&
    person.skills.length === 0
  )
}

/** Minimal person shell from conversation metadata before a full profile fetch. */
export function personFromConversation(conversation: DirectConversation): Person {
  return {
    id: conversation.otherProfileId ?? conversation.id,
    name: conversation.name,
    role: conversation.role,
    department: "",
    homeBase: "",
    city: "",
    availability: conversation.online ? "Available Now" : "Between gigs",
    availableFrom: "",
    availableTo: "",
    venueTiers: [],
    workAuth: [],
    yearsExperience: 0,
    credits: 0,
    vouches: 0,
    topTours: [],
    skills: [],
    avatar: conversation.avatar,
    followed: false,
  }
}

/** Minimal person shell for admin report rows before a full profile fetch. */
export function personFromReportMember(member: {
  id: string
  name: string
  avatar?: string
}): Person {
  return {
    id: member.id,
    name: member.name,
    role: "AWN Member",
    department: "",
    homeBase: "",
    city: "",
    availability: "Between gigs",
    availableFrom: "",
    availableTo: "",
    venueTiers: [],
    workAuth: [],
    yearsExperience: 0,
    credits: 0,
    vouches: 0,
    topTours: [],
    skills: [],
    avatar: member.avatar,
    followed: false,
  }
}

/** Minimal person shell from a room message before a full profile fetch. */
export function personFromRoomMessage(message: ThreadMessage): Person | null {
  if (message.from === "me") return null

  return {
    id: message.authorId ?? message.id,
    name: message.author?.trim() || "Member",
    role: "AWN Member",
    department: "",
    homeBase: "",
    city: "",
    availability: "Between gigs",
    availableFrom: "",
    availableTo: "",
    venueTiers: [],
    workAuth: [],
    yearsExperience: 0,
    credits: 0,
    vouches: 0,
    topTours: [],
    skills: [],
    avatar: message.authorAvatarUrl,
    followed: false,
  }
}
