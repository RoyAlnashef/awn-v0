import type { DirectConversation, ThreadMessage } from "@/lib/messages-data"
import type { Person } from "@/lib/people-data"

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
