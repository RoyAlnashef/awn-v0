"use client"

import type { EngagementType, Job, JobKind, JobStatus, ApplicationStatus } from "@/lib/jobs-data"
import {
  accountJobsKey,
  jobsListKey,
  myApplicationsKey,
} from "@/lib/jobs/swr-keys"

export type JobsListResponse = {
  jobs: Job[]
}

export type AppliedJob = Job & {
  application: {
    id: string
    status: ApplicationStatus
    appliedAt: string
    note: string
  }
}

export type AppliedJobsListResponse = {
  jobs: AppliedJob[]
}

export type CreateJobPayload = {
  kind: JobKind
  role: string
  production: string
  location: string
  payRate: string
  startDate?: string
  endDate?: string
  deadline?: string | null
  engagement: EngagementType
  details: string
  status?: Extract<JobStatus, "draft" | "open">
}

export type UpdateJobPayload = {
  kind?: JobKind
  status?: JobStatus
  role?: string
  production?: string
  location?: string
  payRate?: string
  startDate?: string
  endDate?: string
  deadline?: string | null
  engagement?: EngagementType
  details?: string
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
  viewCount: number
}

export type JobApplication = {
  id: string
  jobId: string
  applicantId: string
  note: string
  status: ApplicationStatus
  createdAt: string
  applicant: {
    name: string
    title: string
    avatar?: string
  }
}

export type JobApplicationsResponse = {
  applications: JobApplication[]
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

export async function fetchMyJobs(
  tab: "created" | "saved",
): Promise<JobsListResponse> {
  const response = await fetch(accountJobsKey(tab))
  return parseJson<JobsListResponse>(response)
}

export async function fetchMyApplications(): Promise<AppliedJobsListResponse> {
  const response = await fetch(myApplicationsKey)
  return parseJson<AppliedJobsListResponse>(response)
}

export async function fetchJob(jobId: string): Promise<JobDetailResponse> {
  const response = await fetch(`/api/jobs/${jobId}`)
  return parseJson<JobDetailResponse>(response)
}

export async function fetchJobApplications(
  jobId: string,
): Promise<JobApplicationsResponse> {
  const response = await fetch(`/api/jobs/${jobId}/applications`)
  return parseJson<JobApplicationsResponse>(response)
}

export async function createJob(payload: CreateJobPayload): Promise<{ job: Job }> {
  const response = await fetch(jobsListKey, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  return parseJson(response)
}

export async function updateJob(
  jobId: string,
  payload: UpdateJobPayload,
): Promise<{ job: Job }> {
  const response = await fetch(`/api/jobs/${jobId}`, {
    method: "PATCH",
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

export async function withdrawFromJob(jobId: string): Promise<void> {
  const response = await fetch(`/api/jobs/${jobId}/apply`, {
    method: "DELETE",
  })
  if (!response.ok) {
    const data = (await response.json()) as { error?: string }
    throw new Error(data.error || "Request failed")
  }
}

export async function toggleSaveJob(jobId: string): Promise<SaveJobResponse> {
  const response = await fetch(`/api/jobs/${jobId}/save`, {
    method: "POST",
  })
  return parseJson(response)
}
