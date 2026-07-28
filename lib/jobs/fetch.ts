"use client"

import type { Job, JobKind } from "@/lib/jobs-data"
import type { EngagementType } from "@/lib/jobs-data"
import { jobsListKey } from "@/lib/jobs/swr-keys"

export type JobsListResponse = {
  jobs: Job[]
}

export type CreateJobPayload = {
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
}

export type ApplyJobPayload = {
  note?: string
}

export type SaveJobResponse = {
  saved: boolean
}

export type JobDetailResponse = {
  job: Job
  applicantCount: number
  posterId: string
}

async function parseJson<T>(response: Response): Promise<T> {
  const data = (await response.json()) as T & { error?: string }
  if (!response.ok) {
    throw new Error(data.error || "Request failed")
  }
  return data
}

export async function fetchJobs(url: string): Promise<JobsListResponse> {
  const response = await fetch(url)
  return parseJson<JobsListResponse>(response)
}

export async function fetchJob(jobId: string): Promise<JobDetailResponse> {
  const response = await fetch(`/api/jobs/${jobId}`)
  return parseJson<JobDetailResponse>(response)
}

export async function createJob(payload: CreateJobPayload): Promise<{ job: Job }> {
  const response = await fetch(jobsListKey, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  return parseJson(response)
}

export async function applyToJob(
  jobId: string,
  payload: ApplyJobPayload,
): Promise<{ ok: true }> {
  const response = await fetch(`/api/jobs/${jobId}/apply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  return parseJson(response)
}

export async function toggleSaveJob(jobId: string): Promise<SaveJobResponse> {
  const response = await fetch(`/api/jobs/${jobId}/save`, {
    method: "POST",
  })
  return parseJson(response)
}
