export type FeaturedGroup = {
  id: string
  emoji: string
  name: string
}

export type NearbyCrewMember = {
  id: string
  name: string
  role: string
  initials: string
  avatarClassName: string
  longitude: number
  latitude: number
}

export type ChecklistItemId = "profile" | "invite" | "help-now"

export type ChecklistItem = {
  id: ChecklistItemId
  title: string
  description: string
  highlighted?: boolean
}

export type MapFilter = "everyone" | "my-crews" | "open-for-work"

export const featuredGroups: FeaturedGroup[] = [
  { id: "musicians", emoji: "🎵", name: "Musicians" },
  { id: "audio", emoji: "🔊", name: "Audio" },
  { id: "backline", emoji: "🎸", name: "Backline & Stage" },
  { id: "lighting", emoji: "💡", name: "Lighting & Video" },
]

export const totalGroupCount = 15

export const groupsJoinTarget = 3

export const homeBase = {
  city: "Denver",
  checkedInCount: 6,
  longitude: -104.9903,
  latitude: 39.7392,
}

export const nearbyCrew: NearbyCrewMember[] = [
  {
    id: "kira",
    name: "Kira Salas",
    role: "FOH",
    initials: "KS",
    avatarClassName: "bg-violet-500/90 text-white",
    longitude: -104.985,
    latitude: 39.742,
  },
  {
    id: "deon",
    name: "Deon Marsh",
    role: "Tour mgr",
    initials: "DM",
    avatarClassName: "bg-success text-success-foreground",
    longitude: -104.995,
    latitude: 39.736,
  },
  {
    id: "ari",
    name: "Ari Pell",
    role: "Lighting",
    initials: "AP",
    avatarClassName: "bg-notification text-notification-foreground",
    longitude: -104.988,
    latitude: 39.731,
  },
]

export const checklistItems: ChecklistItem[] = [
  {
    id: "profile",
    title: "Finish your profile",
    description:
      "Name and role are set from signup. Add a photo, home base, and availability.",
  },
  {
    id: "invite",
    title: "Invite a crew member",
    description:
      "Bring someone you trust onto AWN so you can stay connected on the road.",
  },
  {
    id: "help-now",
    title: "Post a Help Now request",
    description:
      "Try a 24-hour urgent callout — visible to available members near you.",
    highlighted: true,
  },
]

export const mapFilters: { id: MapFilter; label: string }[] = [
  { id: "everyone", label: "Everyone" },
  { id: "my-crews", label: "My crews" },
  { id: "open-for-work", label: "Open for work" },
]
