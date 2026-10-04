import type {
  Feedback,
  FeedbackAttachment,
  FeedbackContext,
  FeedbackImpact,
  FeedbackStatus,
  FeedbackSubmitter,
  FeedbackType,
} from "./types"

/**
 * Temporary in-memory persistence. Every function here maps 1:1 to a future
 * Supabase query (see comments), so wiring the database means replacing the
 * bodies of this file only. Data resets when the server restarts.
 */

export type CreateFeedbackInput = {
  type: FeedbackType
  impact: FeedbackImpact | null
  area: string
  summary: string
  details: string
  allowContact: boolean
  attachments: FeedbackAttachment[]
  context: FeedbackContext
  submitter: FeedbackSubmitter
}

type Store = { items: Feedback[]; nextReference: number }

const globalForFeedback = globalThis as unknown as {
  __awnFeedbackStore?: Store
}

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()
}

const desktopContext = (path: string, title: string): FeedbackContext => ({
  url: `https://app.awrightnetwork.com${path}`,
  pageTitle: title,
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0 Safari/537.36",
  viewport: "1512×857",
  platform: "web",
})

const iosContext = (path: string, title: string): FeedbackContext => ({
  url: `capacitor://localhost${path}`,
  pageTitle: title,
  userAgent:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
  viewport: "393×852",
  platform: "ios",
})

function seed(): Store {
  const items: Feedback[] = [
    {
      id: "fb_seed_1",
      reference: "FB-1007",
      type: "bug",
      status: "new",
      impact: "annoying",
      area: "Now",
      summary: "Location search bar overlaps the pin button on the map",
      details:
        "On the Now page, when the window is around 1400px wide the location search input runs underneath the 'use my location' pin button. I can't click the right edge of the input and the placeholder gets cut off.\n\nExpected: search bar stops before the button.",
      allowContact: true,
      attachments: [
        {
          id: "att_seed_1",
          name: "map-overlap.png",
          url: "/feedback/sample-map-overlap.png",
          contentType: "image/png",
          sizeBytes: 412_000,
        },
      ],
      context: desktopContext("/now", "Now"),
      submitter: {
        id: "u_seed_1",
        name: "Maya Okafor",
        email: "maya@example.com",
        initials: "MO",
      },
      adminNote: "",
      createdAt: hoursAgo(2),
      updatedAt: hoursAgo(2),
    },
    {
      id: "fb_seed_2",
      reference: "FB-1006",
      type: "bug",
      status: "triaged",
      impact: "blocking",
      area: "Jobs",
      summary: "Can't post a job with a start date next month",
      details:
        "Picking any date in November shows 'Invalid date' and the Post Job button stays disabled. Tried on my phone twice. Dates this month work fine.",
      allowContact: true,
      attachments: [
        {
          id: "att_seed_2",
          name: "IMG_2231.png",
          url: "/feedback/sample-job-form-error.png",
          contentType: "image/png",
          sizeBytes: 286_000,
        },
      ],
      context: iosContext("/jobs/new", "Post a job"),
      submitter: {
        id: "u_seed_2",
        name: "Dante Reyes",
        email: "dante@example.com",
        initials: "DR",
      },
      adminNote: "Repro'd on iOS Safari. Timezone parsing in the date picker.",
      createdAt: hoursAgo(9),
      updatedAt: hoursAgo(5),
    },
    {
      id: "fb_seed_3",
      reference: "FB-1005",
      type: "ux",
      status: "new",
      impact: "minor",
      area: "Groups",
      summary: "Not obvious which groups I've already joined",
      details:
        "In Find your groups, joined groups and suggested groups look the same until you scroll and see the Join button. A checkmark or a section header would help.",
      allowContact: false,
      attachments: [],
      context: desktopContext("/groups", "Groups"),
      submitter: {
        id: "u_seed_3",
        name: "Priya Shah",
        email: "priya@example.com",
        initials: "PS",
      },
      adminNote: "",
      createdAt: hoursAgo(20),
      updatedAt: hoursAgo(20),
    },
    {
      id: "fb_seed_4",
      reference: "FB-1004",
      type: "idea",
      status: "planned",
      impact: null,
      area: "People",
      summary: "Filter people by gear they own",
      details:
        "When I need a sub for audio gigs it would be great to filter for people who own their own IEM rig or a console. Could be a 'gear' section on profiles.",
      allowContact: true,
      attachments: [],
      context: desktopContext("/people", "People"),
      submitter: {
        id: "u_seed_4",
        name: "Jordan Lee",
        email: "jordan@example.com",
        initials: "JL",
      },
      adminNote: "Bundling with profile v2.",
      createdAt: hoursAgo(46),
      updatedAt: hoursAgo(30),
    },
    {
      id: "fb_seed_5",
      reference: "FB-1003",
      type: "praise",
      status: "resolved",
      impact: null,
      area: "Now",
      summary: "Help Now got me a stagehand in 15 minutes",
      details:
        "Posted a callout at load-in when someone no-showed and had two replies before I finished my coffee. This alone is worth it.",
      allowContact: true,
      attachments: [],
      context: iosContext("/now", "Now"),
      submitter: {
        id: "u_seed_5",
        name: "Sam Whitaker",
        email: "sam@example.com",
        initials: "SW",
      },
      adminNote: "",
      createdAt: hoursAgo(70),
      updatedAt: hoursAgo(60),
    },
    {
      id: "fb_seed_6",
      reference: "FB-1002",
      type: "ux",
      status: "wont_fix",
      impact: "annoying",
      area: "Messages",
      summary: "Enter sends the message before I'm done typing",
      details:
        "I keep sending half-finished messages. Would prefer Cmd+Enter to send.",
      allowContact: true,
      attachments: [],
      context: desktopContext("/messages", "Messages"),
      submitter: {
        id: "u_seed_6",
        name: "Alex Moreno",
        email: "alex@example.com",
        initials: "AM",
      },
      adminNote:
        "Keeping Enter-to-send for consistency. Shift+Enter adds a new line; will surface a hint.",
      createdAt: hoursAgo(120),
      updatedAt: hoursAgo(96),
    },
  ]

  return { items, nextReference: 1008 }
}

function getStore(): Store {
  if (!globalForFeedback.__awnFeedbackStore) {
    globalForFeedback.__awnFeedbackStore = seed()
  }
  return globalForFeedback.__awnFeedbackStore
}

/** Future: `select ... from feedback join feedback_attachments ... order by created_at desc` */
export async function listFeedbackRecords(): Promise<Feedback[]> {
  return [...getStore().items].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  )
}

/** Future: insert into `feedback`, then insert rows into `feedback_attachments`. */
export async function insertFeedbackRecord(
  input: CreateFeedbackInput,
): Promise<Feedback> {
  const store = getStore()
  const now = new Date().toISOString()
  const record: Feedback = {
    ...input,
    id: crypto.randomUUID(),
    reference: `FB-${store.nextReference++}`,
    status: "new",
    adminNote: "",
    createdAt: now,
    updatedAt: now,
  }
  store.items.unshift(record)
  return record
}

/** Future: `update feedback set status/admin_note, updated_at = now() where id = $1` */
export async function updateFeedbackRecord(
  id: string,
  patch: { status?: FeedbackStatus; adminNote?: string },
): Promise<Feedback | null> {
  const store = getStore()
  const record = store.items.find((item) => item.id === id)
  if (!record) return null
  if (patch.status) record.status = patch.status
  if (patch.adminNote !== undefined) record.adminNote = patch.adminNote
  record.updatedAt = new Date().toISOString()
  return record
}
