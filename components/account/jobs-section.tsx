"use client"

import { Bookmark, Briefcase, Building2, CalendarDays, MapPin, Plus } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Job {
  id: string
  title: string
  company: string
  location: string
  venueTier: string
  type: "Full-time" | "Contract" | "Per-tour"
  postedAt: string
  status?: "Active" | "Closed" | "Draft"
  savedAt?: string
}

const CREATED_JOBS: Job[] = [
  {
    id: "j1",
    title: "Tour Manager — Arena Run",
    company: "Reyes Touring Co.",
    location: "Nashville, TN",
    venueTier: "Arena",
    type: "Contract",
    postedAt: "Jul 18, 2026",
    status: "Active",
  },
  {
    id: "j2",
    title: "Production Coordinator",
    company: "Reyes Touring Co.",
    location: "Remote / Nashville",
    venueTier: "Stadium",
    type: "Per-tour",
    postedAt: "Jun 30, 2026",
    status: "Active",
  },
  {
    id: "j3",
    title: "Advance Manager (Draft)",
    company: "Reyes Touring Co.",
    location: "Los Angeles, CA",
    venueTier: "Arena",
    type: "Contract",
    postedAt: "Jul 28, 2026",
    status: "Draft",
  },
]

const SAVED_JOBS: Job[] = [
  {
    id: "j4",
    title: "Front of House Engineer",
    company: "Neon Tide Productions",
    location: "London, UK",
    venueTier: "Festival",
    type: "Per-tour",
    postedAt: "Jul 20, 2026",
    savedAt: "Jul 22, 2026",
  },
  {
    id: "j5",
    title: "Systems Engineer — European Leg",
    company: "Lofts Live",
    location: "Dublin, IE",
    venueTier: "Arena",
    type: "Contract",
    postedAt: "Jul 15, 2026",
    savedAt: "Jul 16, 2026",
  },
]

const STATUS_STYLES: Record<string, string> = {
  Active: "border-green-500/30 bg-green-500/10 text-green-600",
  Closed: "border-border bg-muted text-muted-foreground",
  Draft: "border-amber-500/30 bg-amber-500/10 text-amber-600",
}

function JobCard({ job, variant }: { job: Job; variant: "created" | "saved" }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border bg-card p-4">
      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-heading text-sm font-semibold">{job.title}</span>
          {job.status && (
            <span
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${STATUS_STYLES[job.status]}`}
            >
              {job.status}
            </span>
          )}
          <span className="text-[10px] font-semibold tracking-wide text-primary uppercase">
            {job.venueTier}
          </span>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Building2 className="size-3" />
            {job.company}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="size-3" />
            {job.location}
          </span>
          <span className="flex items-center gap-1">
            <CalendarDays className="size-3" />
            {variant === "saved" && job.savedAt ? `Saved ${job.savedAt}` : `Posted ${job.postedAt}`}
          </span>
        </div>

        <Badge variant="secondary" className="self-start font-normal">
          {job.type}
        </Badge>
      </div>

      <div className="flex shrink-0 gap-1.5">
        {variant === "created" && (
          <Button size="xs" variant="outline">
            Edit
          </Button>
        )}
        {variant === "saved" && (
          <Button size="xs" variant="ghost" className="text-muted-foreground">
            <Bookmark className="size-3.5" />
            Unsave
          </Button>
        )}
      </div>
    </div>
  )
}

export function JobsSection() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <h3 className="font-heading text-base font-semibold">Jobs</h3>
          <p className="text-sm text-muted-foreground">
            Jobs you've posted and positions you've saved.
          </p>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5">
          <Plus className="size-3.5" />
          Post a job
        </Button>
      </div>

      <Tabs defaultValue="created">
        <TabsList>
          <TabsTrigger value="created" className="gap-1.5">
            <Briefcase className="size-3.5" />
            Created
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
              {CREATED_JOBS.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="saved" className="gap-1.5">
            <Bookmark className="size-3.5" />
            Saved
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold tabular-nums">
              {SAVED_JOBS.length}
            </span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="created" className="mt-4 flex flex-col gap-3">
          {CREATED_JOBS.map((job) => (
            <JobCard key={job.id} job={job} variant="created" />
          ))}
        </TabsContent>

        <TabsContent value="saved" className="mt-4 flex flex-col gap-3">
          {SAVED_JOBS.map((job) => (
            <JobCard key={job.id} job={job} variant="saved" />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}
