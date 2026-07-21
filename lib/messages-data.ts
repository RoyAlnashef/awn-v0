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

/** A single message within a conversation or room thread. */
export interface ThreadMessage {
  id: string
  /** "me" is the signed-in user (right-aligned); "them" is everyone else. */
  from: "me" | "them"
  text: string
  /** Clock label for placeholder display, e.g. "9:41 AM". */
  time: string
  /** Display name for room messages from other members. */
  author?: string
}

/** A joinable community room. */
export interface Room {
  id: string
  name: string
  description: string
  icon: LucideIcon
  /** Whether the current user has already joined this room. */
  joined: boolean
  /** Preview of the latest message in the room. */
  preview: string
  /** Relative time label for the latest activity. */
  time: string
  unread?: boolean
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
    preview: "Welcome to AWN — introduce yourself when you join!",
    time: "2h",
    unread: true,
  },
  {
    id: "r2",
    name: "Musicians",
    description: "Musical directors · Session musicians · Deps.",
    icon: Music,
    joined: false,
    preview: "Anyone know a dep keys player for a festival slot next month?",
    time: "4h",
  },
  {
    id: "r3",
    name: "Assistants",
    description: "Personal assistants to musicians and management.",
    icon: HandHelping,
    joined: false,
    preview: "Best practices for managing artist schedules on the road?",
    time: "6h",
  },
  {
    id: "r4",
    name: "Audio",
    description: "FOH · Monitors · RF · Systems engineering.",
    icon: Speaker,
    joined: false,
    preview: "What's everyone running for in-ear monitoring these days?",
    time: "1h",
    unread: true,
  },
  {
    id: "r5",
    name: "Backline & Stage",
    description: "Guitar · Bass · Drum · Keys · Riggers.",
    icon: Guitar,
    joined: false,
    preview: "Tips for quick string changes between songs?",
    time: "8h",
  },
  {
    id: "r6",
    name: "Help Needed",
    description: "Need something? Post here for last-minute cover.",
    icon: LifeBuoy,
    joined: false,
    preview: "URGENT: Monitor engineer needed for Nashville show Friday.",
    time: "30m",
    unread: true,
  },
  {
    id: "r7",
    name: "Lighting & Video",
    description: "LDs · Programmers · LED · IMAG.",
    icon: Lightbulb,
    joined: false,
    preview: "Looking for recommendations on LED wall processors.",
    time: "12h",
  },
  {
    id: "r8",
    name: "Mental Health",
    description: "Road life is hard. Talk about it here.",
    icon: Brain,
    joined: false,
    preview: "Checking in — how is everyone holding up mid-tour?",
    time: "1d",
  },
  {
    id: "r9",
    name: "Parents on the Road",
    description: "Balancing touring and family life.",
    icon: Baby,
    joined: false,
    preview: "School schedules vs. routing — how do you manage it?",
    time: "2d",
  },
  {
    id: "r10",
    name: "Photo & Content",
    description: "Tour photographers · Videographers · Editors.",
    icon: Camera,
    joined: false,
    preview: "Best camera settings for low-light arena shoots?",
    time: "3d",
  },
  {
    id: "r11",
    name: "Production",
    description: "Tour managers · Production managers · Coordinators.",
    icon: ClipboardList,
    joined: false,
    preview: "Advance checklist template that actually works?",
    time: "5h",
  },
  {
    id: "r12",
    name: "Road Life",
    description: "The daily reality of being on the road.",
    icon: Truck,
    joined: false,
    preview: "Favorite green rooms in the Midwest?",
    time: "1d",
  },
  {
    id: "r13",
    name: "Touring Life",
    description: "Road life, routes, venues, and travel tips.",
    icon: Route,
    joined: false,
    preview: "Best routing tips for avoiding back-to-back red-eyes?",
    time: "2d",
  },
  {
    id: "r14",
    name: "Women of the Industry",
    description: "A space for women working in live touring.",
    icon: Sparkles,
    joined: false,
    preview: "Networking event at PLASA — who's going?",
    time: "4d",
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

const roomThreads: Record<string, ThreadMessage[]> = {
  r1: [
    {
      id: "r1-1",
      from: "them",
      author: "AWN Team",
      text: "Welcome to AWN! This is the main channel for introductions and announcements.",
      time: "10:00 AM",
    },
    {
      id: "r1-2",
      from: "them",
      author: "Marcus Bell",
      text: "Hey everyone — Marcus here, LD based out of Nashville. Just joined!",
      time: "11:30 AM",
    },
    {
      id: "r1-3",
      from: "them",
      author: "Priya Anand",
      text: "Welcome to AWN — introduce yourself when you join!",
      time: "2:15 PM",
    },
  ],
  r4: [
    {
      id: "r4-1",
      from: "them",
      author: "Theo Nakamura",
      text: "Curious what everyone is running for in-ear monitoring these days.",
      time: "9:00 AM",
    },
    {
      id: "r4-2",
      from: "them",
      author: "Liam O'Connor",
      text: "Sennheiser IE 500 Pro here — solid isolation without breaking the bank.",
      time: "9:45 AM",
    },
    {
      id: "r4-3",
      from: "them",
      author: "Priya Anand",
      text: "Shure SE535 for me on most tours. What's everyone running for in-ear monitoring these days?",
      time: "10:02 AM",
    },
  ],
  r6: [
    {
      id: "r6-1",
      from: "them",
      author: "Sofia Marín",
      text: "URGENT: Monitor engineer needed for Nashville show this Friday. DM me if available.",
      time: "3:30 PM",
    },
    {
      id: "r6-2",
      from: "them",
      author: "Elliot Shaw",
      text: "Posting here in case anyone on the bench can cover — show pays well.",
      time: "3:45 PM",
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

/**
 * Returns the transcript for a room, generating a believable fallback from the
 * room preview when no explicit thread exists.
 */
export function getRoomThread(room: Room): ThreadMessage[] {
  const explicit = roomThreads[room.id]
  if (explicit) return explicit

  return [
    {
      id: `${room.id}-1`,
      from: "them",
      author: "AWN Member",
      text: room.preview,
      time: room.time,
    },
  ]
}

/** The default room every member is auto-joined to — always pinned first. */
export const GENERAL_ROOM_ID = "r1"

/**
 * Orders rooms for the inbox: General first, then joined rooms (most recently
 * joined nearest the top), then unjoined rooms in catalog order.
 */
export function sortRoomsForInbox(
  roomList: Room[],
  joinOrder: string[],
): Room[] {
  const byId = new Map(roomList.map((r) => [r.id, r]))
  const catalogOrder = roomList.map((r) => r.id)

  const general = byId.get(GENERAL_ROOM_ID)
  const joinedIds = joinOrder.filter(
    (id) => id !== GENERAL_ROOM_ID && byId.get(id)?.joined,
  )
  const joinedRooms = joinedIds
    .map((id) => byId.get(id))
    .filter((r): r is Room => r != null)

  const accounted = new Set([GENERAL_ROOM_ID, ...joinedIds])
  const extraJoined = roomList.filter(
    (r) => r.joined && r.id !== GENERAL_ROOM_ID && !accounted.has(r.id),
  )
  const unjoined = roomList
    .filter((r) => !r.joined)
    .sort(
      (a, b) => catalogOrder.indexOf(a.id) - catalogOrder.indexOf(b.id),
    )

  return [
    ...(general ? [general] : []),
    ...joinedRooms,
    ...extraJoined,
    ...unjoined,
  ]
}

/** Count of unread rooms the current user has joined (for nav badges). */
export function joinedRoomUnreadCount(roomList: Room[] = rooms): number {
  return roomList.filter((r) => r.joined && r.unread).length
}

/** Count of unread direct conversations (for nav badges). */
export function directConversationUnreadCount(
  conversationList: DirectConversation[] = directConversations,
): number {
  return conversationList.filter((c) => c.unread).length
}

/**
 * Orders conversations for the inbox: most recently active first, then any
 * conversations not yet tracked in activity order (catalog order).
 */
export function sortConversationsForInbox(
  conversationList: DirectConversation[],
  activityOrder: string[],
): DirectConversation[] {
  const byId = new Map(conversationList.map((c) => [c.id, c]))
  const catalogOrder = conversationList.map((c) => c.id)

  const ordered = activityOrder
    .map((id) => byId.get(id))
    .filter((c): c is DirectConversation => c !== undefined)

  const orderedIds = new Set(activityOrder)
  const rest = catalogOrder
    .filter((id) => !orderedIds.has(id))
    .map((id) => byId.get(id)!)

  return [...ordered, ...rest]
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
