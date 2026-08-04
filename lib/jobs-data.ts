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
  created_at: string
  updated_at: string
}

export interface JobApplicationRow {
  id: string
  job_id: string
  applicant_id: string
  note: string
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
}

function job(
  data: Omit<
    Job,
    "department" | "kind" | "status" | "saved" | "applied" | "posterId"
  > &
    Partial<Pick<Job, "kind" | "status" | "saved" | "applied" | "posterId">>,
): Job {
  return {
    kind: "full",
    status: "open",
    saved: false,
    applied: false,
    posterId: "00000000-0000-4000-8000-000000000000",
    ...data,
    department: departmentByRole[data.role] ?? "Production",
  }
}

export const jobs: Job[] = [
  job({
    id: "1",
    role: "Equipment Manager",
    production: "Taylow Swift · Minutes Tour",
    location: "Bakersfield, CA → Tampa, FL · all cities",
    payRate: "$2,400/wk + per diem",
    startDate: "2026-08-05",
    endDate: "2026-10-30",
    deadline: "2026-08-06",
    engagement: "Touring",
    details:
      "There's a lot of equipment to manage here. Each member of the band travels with their own rig, and we need someone detail-obsessed to keep every case tracked from truck to stage and back.",
    postedBy: { name: "Roy Alnashef", role: "Tour Manager", avatar: "/images/avatar-jordan.png" },
    postedAt: "Today",
  }),
  job({
    id: "2",
    role: "Front of House Engineer",
    production: "Meridian · Afterglow World Tour",
    location: "Nationwide US · arena routing",
    payRate: "$3,200/wk",
    startDate: "2026-09-12",
    endDate: "2027-02-28",
    deadline: "2026-08-20",
    engagement: "Touring",
    details:
      "Seasoned FOH engineer needed for a full arena run. DiGiCo Quantum experience required, Waves rack a plus. You'll own the mix from soundcheck to encore across 60+ dates.",
    postedBy: { name: "Dana Okafor", role: "Production Manager" },
    postedAt: "2h ago",
  }),
  job({
    id: "3",
    role: "Lighting Programmer",
    production: "Sunfall Festival 2026",
    location: "Barcelona, ES · main stage",
    payRate: "€450/day",
    startDate: "2026-07-18",
    endDate: "2026-07-21",
    deadline: "2026-07-01",
    engagement: "Festival",
    details:
      "Fast-paced festival weekend with tight changeovers. MA3 programmer who can busk and pre-viz confidently. Multiple headliners per night, so grace under pressure is everything.",
    postedBy: { name: "Marco Beniti", role: "Lighting Designer" },
    postedAt: "Yesterday",
  }),
  job({
    id: "4",
    role: "Video Engineer / EIC",
    production: "Aurora · One Night Only",
    location: "Los Angeles, CA · The Forum",
    payRate: "$1,100/day",
    startDate: "2026-08-29",
    endDate: "2026-08-29",
    deadline: "2026-08-10",
    engagement: "One-Off",
    details:
      "Single-night broadcast capture for a livestream special. EIC to lead a small camera package and manage shading. Union call, meal penalties respected.",
    postedBy: { name: "Priya Nair", role: "Technical Director" },
    postedAt: "3d ago",
  }),
  job({
    id: "5",
    role: "Drum Tech",
    production: "The Hollows · Studio Sessions",
    location: "Nashville, TN · studio-based",
    payRate: "$500/day",
    startDate: "2026-08-14",
    endDate: "2026-08-22",
    deadline: "2026-08-01",
    engagement: "Session",
    details:
      "Two weeks of tracking sessions. Tuning, maintenance, and quick kit changes between takes. Vintage kit knowledge appreciated — we're chasing a specific room sound.",
    postedBy: { name: "Cole Barrett", role: "Backline Crew Chief" },
    postedAt: "5d ago",
  }),
  job({
    id: "6",
    role: "Monitor Engineer",
    production: "Casino Royale · Vegas Residency",
    location: "Las Vegas, NV · resident venue",
    payRate: "$2,800/wk",
    startDate: "2026-10-01",
    endDate: "2027-04-30",
    deadline: "2026-09-01",
    engagement: "Residency",
    details:
      "Long-run residency with a stable show file. IEM-heavy stage, six-piece band plus tracks. Consistency and a calm stage presence matter more than flash here.",
    postedBy: { name: "Simone Lefevre", role: "Production Manager" },
    postedAt: "1w ago",
  }),
  job({
    id: "7",
    role: "Head Rigger",
    production: "Voltage · Amphitheater Run",
    location: "West Coast US · sheds",
    payRate: "$2,600/wk",
    startDate: "2026-06-20",
    endDate: "2026-09-05",
    deadline: "2026-06-05",
    engagement: "Touring",
    details:
      "Ground-up rigging lead for a summer amphitheater run. ETCP certification required. You'll build points, manage local crews, and keep the load-in on schedule.",
    postedBy: { name: "Dana Okafor", role: "Production Manager" },
    postedAt: "1w ago",
  }),
  job({
    id: "8",
    role: "Wardrobe Head",
    production: "Nova · Iridescent Tour",
    location: "UK / Europe · theater routing",
    payRate: "£1,900/wk",
    startDate: "2026-09-05",
    endDate: "2026-12-18",
    deadline: "2026-08-15",
    engagement: "Touring",
    details:
      "Lead a two-person wardrobe department across a European theater run. Quick changes, laundry logistics, and daily steaming. Couture handling experience preferred.",
    postedBy: { name: "Ingrid Sørensen", role: "Tour Manager" },
    postedAt: "2w ago",
  }),
]
