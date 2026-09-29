import { format } from "date-fns"

export type EngagementType =
  | "Touring"
  | "Festival"
  | "One-Off"
  | "Session"
  | "Residency"

export type JobKind = "full" | "urgent"

export type JobStatus = "open" | "draft" | "filled" | "expired" | "deleted"

export type ApplicationStatus =
  | "pending"
  | "approved"
  | "maybe"
  | "declined"
  | "withdrawn"

/** Row shape returned from Supabase `job_postings`. */
export interface JobPostingRow {
  id: string
  kind: JobKind
  status: JobStatus
  poster_id: string
  role: string
  department: string
  production: string
  location: string
  pay_rate: string
  start_date: string
  end_date: string
  deadline: string | null
  engagement: EngagementType
  details: string
  expires_at: string | null
  filled_at: string | null
  view_count: number
  share_count: number
  is_hidden: boolean
  created_at: string
  updated_at: string
}

export interface JobApplicationRow {
  id: string
  job_id: string
  applicant_id: string
  note: string
  resume_url: string | null
  status: ApplicationStatus
  created_at: string
  updated_at: string
}

export interface CreateJobInput {
  kind: JobKind
  role: string
  production: string
  location: string
  payRate: string
  startDate: string
  endDate: string
  deadline?: string | null
  engagement: EngagementType
  details: string
  status?: Extract<JobStatus, "draft" | "open">
}

/**
 * Parses a date-only string ("YYYY-MM-DD") as a local date.
 * Using `new Date("YYYY-MM-DD")` parses as UTC midnight, which shifts the
 * calendar day depending on the runtime timezone and causes SSR/client
 * hydration mismatches. Constructing from parts keeps the day stable.
 */
export function parseDateOnly(value: string) {
  const [year, month, day] = value.split("-").map(Number)
  return new Date(year, month - 1, day)
}

export function formatDateRange(start: string, end: string) {
  const s = parseDateOnly(start)
  const e = parseDateOnly(end)
  if (start === end) return format(s, "MMM d, yyyy")
  const sameYear = s.getFullYear() === e.getFullYear()
  return `${format(s, sameYear ? "MMM d" : "MMM d, yyyy")} → ${format(e, "MMM d, yyyy")}`
}

export const engagementTypes: EngagementType[] = [
  "Touring",
  "Festival",
  "One-Off",
  "Session",
  "Residency",
]

/** User-facing label; stored DB/API value may still be `Touring`. */
export function engagementDisplayLabel(type: EngagementType | string): string {
  if (type === "Touring") return "Multi-market"
  return type
}

export interface RoleGroup {
  department: string
  roles: string[]
}

/**
 * The full, segmented list of crew roles. Grouped by department so the same
 * source powers the role <Select> in the post form and the department filter.
 */
export const roleGroups: RoleGroup[] = [
  {
    department: "Production",
    roles: [
      "Tour Manager",
      "Tour Manager / FOH",
      "Assistant Tour Manager",
      "Road Manager",
      "Production Manager",
      "Assistant Production Manager",
      "Production Coordinator",
      "Production Assistant",
      "Stage Manager",
      "Show Director",
      "Show Caller",
      "Technical Director",
      "Advance Coordinator",
      "Tour Accountant",
      "Tour Logistics Manager",
      "Equipment Manager",
      "Production Consultant",
      "Labor Coordinator",
    ],
  },
  {
    department: "Audio",
    roles: [
      "Front of House Engineer",
      "Monitor Engineer",
      "Systems Engineer",
      "A2 / Audio Tech",
      "RF Coordinator",
      "RF Tech",
      "Playback Engineer",
      "Recording Engineer",
      "Broadcast Audio Engineer",
      "DJ Tech",
      "Frequency Coordinator",
      "PA Systems Tech",
      "Audio Crew Chief",
      "Audio Shop Manager",
    ],
  },
  {
    department: "Lighting",
    roles: [
      "Lighting Director (LD)",
      "Lighting Programmer",
      "Lighting Crew Chief",
      "Lighting Tech",
      "Follow Spot Operator",
      "Dimmer Tech",
      "Electrician",
      "Blacktrax Tech",
      "Zactrack Tech",
      "Robe Robospot Tech",
      "Lighting Designer",
      "Lighting Shop Manager",
    ],
  },
  {
    department: "Video",
    roles: [
      "Video Director",
      "Video Engineer / EIC",
      "Video Crew Chief",
      "LED Crew Chief",
      "LED Tech",
      "Camera Director",
      "Camera Operator",
      "Media Server Tech",
      "Disguise / D3 Programmer",
      "Notch Operator",
      "Resolume Tech",
      "Live Stream Engineer",
      "Projectionist",
      "Content Designer",
      "Video Playback Operator",
      "Drone Operator",
      "SteadiCam Operator",
      "Jib Operator",
      "Video Tech",
      "Video Shop Manager",
    ],
  },
  {
    department: "Backline",
    roles: [
      "Backline Crew Chief",
      "Guitar Tech",
      "Bass Tech",
      "Drum Tech",
      "Keys Tech",
      "Synth Tech",
      "Amp Tech",
      "Backline Shop Manager",
    ],
  },
  {
    department: "Rigging & Automation",
    roles: [
      "Head Rigger",
      "Up Rigger",
      "Down Rigger",
      "Ground Rigger",
      "Automation Operator",
      "Rigging Crew Chief",
    ],
  },
  {
    department: "Wardrobe & Styling",
    roles: [
      "Wardrobe Head",
      "Wardrobe Assistant",
      "Seamstress / Stitcher",
      "Hair & Makeup",
      "Costume Designer",
    ],
  },
  {
    department: "Crew & Logistics",
    roles: [
      "Truck Driver",
      "Bus Driver",
      "Runner",
      "Loader / Local Hand",
      "Catering Lead",
      "Site Coordinator",
      "Security Lead",
      "Touring Medic",
    ],
  },
]

/** Flat list of all crew roles for comboboxes and search. */
export const allRoles = roleGroups.flatMap((group) => group.roles)

/** All production departments for filters and profile forms. */
export const departments = roleGroups.map((group) => group.department)

/** Reverse lookup so a job's role resolves to its department. */
export const departmentByRole: Record<string, string> = roleGroups.reduce(
  (acc, group) => {
    for (const role of group.roles) {
      acc[role] = group.department
    }
    return acc
  },
  {} as Record<string, string>,
)

export interface JobPoster {
  name: string
  role: string
  avatar?: string
}

export interface Job {
  id: string
  kind: JobKind
  status: JobStatus
  posterId: string
  role: string
  department: string
  production: string
  location: string
  payRate: string
  /** ISO date-only strings (YYYY-MM-DD). */
  startDate: string
  endDate: string
  deadline: string
  engagement: EngagementType
  details: string
  postedBy: JobPoster
  postedAt: string
  saved: boolean
  applied: boolean
  savedAt?: string
  /** Populated on poster management views. */
  viewCount?: number
  /** Populated on poster management views. */
  applicationCount?: number
  /** Populated on poster management views. */
  shareCount?: number
  /** Populated on poster management views. */
  isHidden?: boolean
}
