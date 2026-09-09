export type StatusTone = "success" | "muted" | "warning"

export interface ProximityMember {
  id: string
  initials: string
  name: string
  role: string
  location: string
  /** Travel distance in miles. */
  distance: number
  status: string
  statusTone: StatusTone
  checkedIn: string
  /** Identity color (any CSS color). */
  color: string
  /** Position on the radar, as a percentage of the square canvas. */
  x: number
  y: number
  /** Larger node for anchor members. */
  emphasis?: boolean
  /** The signed-in user sits at the center and is not selectable. */
  isYou?: boolean
}

export const proximityMembers: ProximityMember[] = [
  {
    id: "ra",
    initials: "RA",
    name: "Roy Alnashef",
    role: "You",
    location: "Denver, CO",
    distance: 0,
    status: "Checked in",
    statusTone: "success",
    checkedIn: "just now",
    color: "oklch(0.75 0.15 162)",
    x: 50,
    y: 51,
    emphasis: true,
    isYou: true,
  },
  {
    id: "ph",
    initials: "PH",
    name: "Petra Hallam",
    role: "Merch lead",
    location: "Denver, CO",
    distance: 3,
    status: "At venue",
    statusTone: "success",
    checkedIn: "12 min ago",
    color: "oklch(0.78 0.13 200)",
    x: 44,
    y: 66,
  },
  {
    id: "dm",
    initials: "DM",
    name: "Deon Marsh",
    role: "Tour manager",
    location: "Denver, CO",
    distance: 4,
    status: "On the road",
    statusTone: "success",
    checkedIn: "40 min ago",
    color: "oklch(0.76 0.13 168)",
    x: 55,
    y: 64,
    emphasis: true,
  },
  {
    id: "ap",
    initials: "AP",
    name: "Ari Pell",
    role: "Lighting design",
    location: "Denver, CO",
    distance: 7,
    status: "At venue",
    statusTone: "success",
    checkedIn: "1 hr ago",
    color: "oklch(0.72 0.16 55)",
    x: 30,
    y: 55,
  },
  {
    id: "ml",
    initials: "ML",
    name: "Mira Loft",
    role: "Rigger",
    location: "Aurora, CO",
    distance: 12,
    status: "Loading in",
    statusTone: "warning",
    checkedIn: "25 min ago",
    color: "oklch(0.78 0.16 145)",
    x: 58,
    y: 58,
  },
  {
    id: "jr",
    initials: "JR",
    name: "Jonah Reyes",
    role: "Video engineer",
    location: "Boulder, CO",
    distance: 16,
    status: "On the road",
    statusTone: "success",
    checkedIn: "8 min ago",
    color: "oklch(0.65 0.2 292)",
    x: 36,
    y: 47,
  },
  {
    id: "ib",
    initials: "IB",
    name: "Ivan Boyd",
    role: "Stage tech",
    location: "Boulder, CO",
    distance: 22,
    status: "Off tonight",
    statusTone: "muted",
    checkedIn: "3 hr ago",
    color: "oklch(0.7 0.16 25)",
    x: 49,
    y: 38,
  },
  {
    id: "ks",
    initials: "KS",
    name: "Kira Salas",
    role: "FOH engineer",
    location: "Longmont, CO",
    distance: 28,
    status: "On the road",
    statusTone: "success",
    checkedIn: "18 min ago",
    color: "oklch(0.66 0.19 300)",
    x: 40,
    y: 37,
  },
  {
    id: "tv",
    initials: "TV",
    name: "Tessa Vaughn",
    role: "Monitor engineer",
    location: "Fort Collins, CO",
    distance: 34,
    status: "At venue",
    statusTone: "success",
    checkedIn: "52 min ago",
    color: "oklch(0.7 0.15 245)",
    x: 61,
    y: 43,
  },
  {
    id: "cs",
    initials: "CS",
    name: "Colin Shaw",
    role: "Backline",
    location: "Colorado Springs, CO",
    distance: 41,
    status: "Off tonight",
    statusTone: "muted",
    checkedIn: "5 hr ago",
    color: "oklch(0.8 0.14 95)",
    x: 24,
    y: 64,
  },
  {
    id: "nb",
    initials: "NB",
    name: "Nadia Brooks",
    role: "Production assistant",
    location: "Pueblo, CO",
    distance: 52,
    status: "On the road",
    statusTone: "success",
    checkedIn: "2 hr ago",
    color: "oklch(0.72 0.15 350)",
    x: 38,
    y: 74,
  },
]

export const proximityRings = [
  { label: "Same region", size: 100 },
  { label: "Day drive · under 80 mi", size: 68 },
  { label: "Same city · under 25 mi", size: 40 },
]

export function memberNodeStyle(color: string, active: boolean) {
  return {
    backgroundColor: `color-mix(in oklch, ${color} 22%, transparent)`,
    borderColor: `color-mix(in oklch, ${color} ${active ? 95 : 55}%, transparent)`,
    color,
  } as const
}
