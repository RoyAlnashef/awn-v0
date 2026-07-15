import type { LucideIcon } from "lucide-react"
import {
  Baby,
  Brain,
  Camera,
  ClipboardList,
  Guitar,
  Hash,
  HandHelping,
  LifeBuoy,
  Lightbulb,
  Music,
  Route,
  Speaker,
  Sparkles,
  Truck,
} from "lucide-react"

import { people, type Person } from "@/lib/people-data"

/** A one-to-one direct conversation shown under the "Direct" tab. */
export interface DirectConversation {
  id: string
  name: string
  /** Job title / department, shown in the thread header. */
  role: string
  /** Preview of the latest message. Prefix with "You: " for sent messages. */
  preview: string
  /** Relative time label for placeholder display. */
  time: string
  unread: boolean
  online: boolean
  avatar?: string
  /** True for a conversation just started from "New message" (empty transcript). */
  isNew?: boolean
}

/** A single message within a direct-conversation thread. */
export interface ThreadMessage {
  id: string
  /** "me" is the signed-in user (right-aligned); "them" is the contact. */
  from: "me" | "them"
  text: string
  /** Clock label for placeholder display, e.g. "9:41 AM". */
  time: string
}

/** A joinable community room shown under the "Rooms" tab. */
export interface Room {
  id: string
  name: string
  description: string
  icon: LucideIcon
  /** Whether the current user has already joined this room. */
  joined: boolean
}

export const directConversations: DirectConversation[] = [
  {
    id: "d1",
    name: "Marcus Bell",
    role: "Lighting Director",
    preview: "Are you around for the Ultraviolet stadium run in September?",
    time: "40m",
    unread: true,
    online: true,
  },
  {
    id: "d2",
    name: "Priya Anand",
    role: "Front of House Engineer",
    preview: "Sounds good — let's lock in the Neon Tide dates.",
    time: "5h",
    unread: true,
    online: false,
  },
  {
    id: "d3",
    name: "Aisha Khan",
    role: "Stage Manager",
    preview: "Load-in got pushed to 7am — heads up everyone.",
    time: "1d",
    unread: true,
    online: false,
  },
  {
    id: "d4",
    name: "Sofia Marín",
    role: "Production Manager",
    preview: "You: I'll send the advance over tonight.",
    time: "2h",
    unread: false,
    online: false,
  },
  {
    id: "d5",
    name: "Theo Nakamura",
    role: "Monitor Engineer",
    preview: "Reacted to your message",
    time: "2d",
    unread: false,
    online: true,
  },
  {
    id: "d6",
    name: "Elliot Shaw",
    role: "Guitar Tech",
    preview: "Thanks for the vouch — really appreciate it!",
    time: "3d",
    unread: false,
    online: false,
  },
  {
    id: "d7",
    name: "Dana Whitfield",
    role: "Video Director",
    preview: "You: Can you cover the festival dates in July?",
    time: "5d",
    unread: false,
    online: false,
  },
  {
    id: "d8",
    name: "Liam O'Connor",
    role: "Systems Engineer",
    preview: "Let me check the system rider and get back to you.",
    time: "1w",
    unread: false,
    online: false,
  },
]

export const rooms: Room[] = [
  {
    id: "r1",
    name: "General",
    description: "The main AWN channel — introductions and announcements.",
    icon: Hash,
    joined: true,
  },
  {
    id: "r2",
    name: "Musicians",
    description: "Musical directors · Session musicians · Deps.",
    icon: Music,
    joined: false,
  },
  {
    id: "r3",
    name: "Assistants",
    description: "Personal assistants to musicians and management.",
    icon: HandHelping,
    joined: false,
  },
  {
    id: "r4",
    name: "Audio",
    description: "FOH · Monitors · RF · Systems engineering.",
    icon: Speaker,
    joined: false,
  },
  {
    id: "r5",
    name: "Backline & Stage",
    description: "Guitar · Bass · Drum · Keys · Riggers.",
    icon: Guitar,
    joined: false,
  },
  {
    id: "r6",
    name: "Help Needed",
    description: "Need something? Post here for last-minute cover.",
    icon: LifeBuoy,
    joined: false,
  },
  {
    id: "r7",
    name: "Lighting & Video",
    description: "LDs · Programmers · LED · IMAG.",
    icon: Lightbulb,
    joined: false,
  },
  {
    id: "r8",
    name: "Mental Health",
    description: "Road life is hard. Talk about it here.",
    icon: Brain,
    joined: false,
  },
  {
    id: "r9",
    name: "Parents on the Road",
    description: "Balancing touring and family life.",
    icon: Baby,
    joined: false,
  },
  {
    id: "r10",
    name: "Photo & Content",
    description: "Tour photographers · Videographers · Editors.",
    icon: Camera,
    joined: false,
  },
  {
    id: "r11",
    name: "Production",
    description: "Tour managers · Production managers · Coordinators.",
    icon: ClipboardList,
    joined: false,
  },
  {
    id: "r12",
    name: "Road Life",
    description: "The daily reality of being on the road.",
    icon: Truck,
    joined: false,
  },
  {
    id: "r13",
    name: "Touring Life",
    description: "Road life, routes, venues, and travel tips.",
    icon: Route,
    joined: false,
  },
  {
    id: "r14",
    name: "Women of the Industry",
    description: "A space for women working in live touring.",
    icon: Sparkles,
    joined: false,
  },
]

/**
 * Placeholder transcripts keyed by conversation id. Any conversation without an
 * explicit thread falls back to a short exchange derived from its preview (see
 * getThread), so every conversation opens a populated thread.
 */
const messageThreads: Record<string, ThreadMessage[]> = {
  d1: [
    {
      id: "d1-1",
      from: "them",
      text: "Hey Jordan! Hope the Cassette Kids run wrapped well.",
      time: "9:12 AM",
    },
    {
      id: "d1-2",
      from: "me",
      text: "It did, thanks! Just got back off the road last week.",
      time: "9:20 AM",
    },
    {
      id: "d1-3",
      from: "them",
      text: "Amazing. Are you around for the Ultraviolet stadium run in September?",
      time: "9:41 AM",
    },
  ],
  d2: [
    {
      id: "d2-1",
      from: "me",
      text: "Priya — got the Neon Tide routing through. Dates look good on my end.",
      time: "1:02 PM",
    },
    {
      id: "d2-2",
      from: "them",
      text: "Perfect. The European leg is the tricky part but we can make it work.",
      time: "1:15 PM",
    },
    {
      id: "d2-3",
      from: "them",
      text: "Sounds good — let's lock in the Neon Tide dates.",
      time: "1:16 PM",
    },
  ],
  d3: [
    {
      id: "d3-1",
      from: "them",
      text: "Quick one for the whole crew before tomorrow.",
      time: "8:30 AM",
    },
    {
      id: "d3-2",
      from: "them",
      text: "Load-in got pushed to 7am — heads up everyone.",
      time: "8:31 AM",
    },
    {
      id: "d3-3",
      from: "me",
      text: "Noted, thanks Aisha. I'll let the backline team know.",
      time: "8:45 AM",
    },
  ],
}

/** The signed-in user, used for right-aligned messages in a thread. */
export const currentUser = {
  name: "Jordan Ellis",
  avatar: "/images/avatar-jordan.png",
}

/**
 * Returns the transcript for a conversation, generating a believable fallback
 * exchange from the conversation preview when no explicit thread exists.
 */
export function getThread(conversation: DirectConversation): ThreadMessage[] {
  // Conversations started from "New message" begin with an empty transcript.
  if (conversation.isNew) return []

  const explicit = messageThreads[conversation.id]
  if (explicit) return explicit

  const sentByMe = conversation.preview.startsWith("You: ")
  const previewText = sentByMe
    ? conversation.preview.slice(5)
    : conversation.preview

  return [
    {
      id: `${conversation.id}-1`,
      from: "them",
      text: `Hey Jordan — good to connect here on AWN.`,
      time: "Earlier",
    },
    {
      id: `${conversation.id}-2`,
      from: sentByMe ? "me" : "them",
      text: previewText,
      time: conversation.time,
    },
  ]
}

/** Names that are shown as online in the existing Direct conversations. */
const onlineConversationNames = new Set(
  directConversations.filter((c) => c.online).map((c) => c.name),
)

/**
 * Placeholder online status for the "New message" people picker. A member is
 * treated as online if they're marked Available Now, or already appear online
 * in an existing conversation.
 */
export function isPersonOnline(person: Person): boolean {
  return (
    person.availability === "Available Now" ||
    onlineConversationNames.has(person.name)
  )
}

/** People that can be searched and messaged from the "New message" drawer. */
export const messageablePeople: Person[] = people

/** Builds a fresh, empty Direct conversation from a person. */
export function personToConversation(person: Person): DirectConversation {
  return {
    id: `person-${person.id}`,
    name: person.name,
    role: person.role,
    preview: "New conversation",
    time: "Now",
    unread: false,
    online: isPersonOnline(person),
    avatar: person.avatar,
    isNew: true,
  }
}
