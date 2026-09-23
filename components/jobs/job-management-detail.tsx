"use client"

import type { ComponentType, KeyboardEvent } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { Eye, Pencil, Share2, Users } from "lucide-react"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import useSWR from "swr"

import type { Job } from "@/lib/jobs-data"
import { acceptJobApplicationWithMessage } from "@/lib/jobs/application-actions"
import {
  fetchJobApplications,
  updateJobApplicationStatus,
  type JobApplication,
  type ReviewApplicationStatus,
} from "@/lib/jobs/fetch"
import { applicationStatusConfig } from "@/lib/jobs/format"
import { JobStatusSelect } from "@/components/jobs/job-status-select"
import { JobStatusBadge } from "@/components/jobs/job-status-badge"
import { prefetchThread } from "@/lib/messages/hooks/use-thread"
import { jobApplicationsKey } from "@/lib/jobs/swr-keys"
import type { Person } from "@/lib/people-data"
import { JobApplicationReviewFooter } from "@/components/jobs/job-application-review-footer"
import { PersonProfileDrawer } from "@/components/people/person-profile-drawer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { JobPageLayout } from "@/components/jobs/job-page-layout"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { findNavItem } from "@/lib/nav"
import { cn, truncateWords } from "@/lib/utils"

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
}

function personFromApplication(application: JobApplication): Person {
  const { applicant, applicantId } = application
  return {
    id: applicantId,
    name: applicant.name,
    role: applicant.title,
    department: "",
    homeBase: "",
    city: "",
    availability: "Between Tours",
    availableFrom: "",
    availableTo: "",
    venueTiers: [],
    workAuth: [],
    yearsExperience: 0,
    credits: 0,
    vouches: 0,
    topTours: [],
    skills: [],
    avatar: applicant.avatar,
    followed: false,
    website: applicant.socialLinks.website,
    instagram: applicant.socialLinks.instagram,
    facebook: applicant.socialLinks.facebook,
    twitter: applicant.socialLinks.twitter,
    linkedin: applicant.socialLinks.linkedin,
    youtube: applicant.socialLinks.youtube,
  }
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string | number
  icon: ComponentType<{ className?: string }>
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        <Icon className="size-3.5" />
        {label}
      </div>
      <p className="font-heading text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  )
}

function ApplicantTableSkeleton() {
  return (
    <>
      {Array.from({ length: 2 }).map((_, index) => (
        <TableRow key={index} className="hover:bg-transparent">
          <TableCell className="max-w-0 whitespace-normal">
            <Skeleton className="h-9 w-40" />
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 md:hidden">
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 w-24" />
            </div>
          </TableCell>
          <TableCell className="hidden md:table-cell">
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell className="hidden md:table-cell">
            <Skeleton className="h-5 w-16 rounded-full" />
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

function ApplicantTableRow({
  application,
  onSelect,
}: {
  application: JobApplication
  onSelect: (application: JobApplication) => void
}) {
  const appliedAtLabel = format(
    new Date(application.createdAt),
    "MMM d, yyyy",
  )
  const statusBadge = (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${applicationStatusConfig[application.status].className}`}
    >
      {applicationStatusConfig[application.status].label}
    </span>
  )

  function handleKeyDown(event: KeyboardEvent<HTMLTableRowElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      onSelect(application)
    }
  }

  return (
    <TableRow
      tabIndex={0}
      role="button"
      aria-label={`Review application from ${application.applicant.name}`}
      className={cn("cursor-pointer focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50")}
      onClick={() => onSelect(application)}
      onKeyDown={handleKeyDown}
    >
      <TableCell className="max-w-0 whitespace-normal">
        <div className="flex flex-col gap-1.5">
          <div className="group flex min-w-0 items-center gap-3">
            <Avatar className="size-8 shrink-0">
              <AvatarImage src={application.applicant.avatar} alt="" />
              <AvatarFallback className="text-xs">
                {initials(application.applicant.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium group-hover:underline">
                {application.applicant.name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {application.applicant.title}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 md:hidden">
            {statusBadge}
            <span className="text-xs text-muted-foreground">
              {appliedAtLabel}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell className="hidden text-xs text-muted-foreground md:table-cell">
        {appliedAtLabel}
      </TableCell>
      <TableCell className="hidden md:table-cell">{statusBadge}</TableCell>
    </TableRow>
  )
}

export function JobManagementDetail({ job: initialJob }: { job: Job }) {
  const [currentJob, setCurrentJob] = useState(initialJob)
  const { data, isLoading, error, mutate } = useSWR(
    jobApplicationsKey(initialJob.id),
    () => fetchJobApplications(initialJob.id),
  )
  const [selectedApplication, setSelectedApplication] =
    useState<JobApplication | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [isUpdating, startUpdateTransition] = useTransition()

  const applications = data?.applications ?? []

  function handleSelectApplication(application: JobApplication) {
    const isFirstMount = selectedApplication === null
    setSelectedApplication(application)
    if (isFirstMount) {
      requestAnimationFrame(() => setDrawerOpen(true))
    } else {
      setDrawerOpen(true)
    }
  }

  function handleDrawerOpenChange(open: boolean) {
    setDrawerOpen(open)
  }

  function handleStatusChange(status: ReviewApplicationStatus) {
    if (!selectedApplication) return

    startUpdateTransition(async () => {
      try {
        await updateJobApplicationStatus(
          currentJob.id,
          selectedApplication.id,
          status,
        )
        toast.success(
          status === "maybe"
            ? "Application marked as maybe"
            : "Application declined",
        )
        setSelectedApplication((current) =>
          current ? { ...current, status } : null,
        )
        void mutate(
          (current) =>
            current
              ? {
                  applications: current.applications.map((application) =>
                    application.id === selectedApplication.id
                      ? { ...application, status }
                      : application,
                  ),
                }
              : current,
          { revalidate: false },
        )
      } catch (updateError) {
        toast.error(
          updateError instanceof Error
            ? updateError.message
            : "Could not update application",
        )
      }
    })
  }

  function handleAcceptWithMessage(message: string) {
    if (!selectedApplication) return

    startUpdateTransition(async () => {
      const result = await acceptJobApplicationWithMessage({
        jobId: currentJob.id,
        applicationId: selectedApplication.id,
        message,
      })

      if (!result.ok) {
        toast.error(result.error)
        return
      }

      toast.success("Application accepted — conversation started")
      prefetchThread(result.conversationId)
      setSelectedApplication((current) =>
        current ? { ...current, status: "approved" } : null,
      )
      void mutate(
        (current) =>
          current
            ? {
                applications: current.applications.map((application) =>
                  application.id === selectedApplication.id
                    ? { ...application, status: "approved" }
                    : application,
                ),
              }
            : current,
        { revalidate: false },
      )
    })
  }

  const myJobsNav = findNavItem("/my-jobs/created")

  return (
    <JobPageLayout
      bordered={false}
      title={currentJob.role}
      description={currentJob.production || "Job management"}
      breadcrumb={
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/my-jobs/created" />}>
                {myJobsNav?.title ?? "My Jobs"}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage title={currentJob.role}>
                {truncateWords(currentJob.role)}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      }
      actions={
        <>
          <JobStatusSelect
            jobId={currentJob.id}
            status={currentJob.status}
            onStatusChange={(_status, updatedJob) => setCurrentJob(updatedJob)}
          />
          <Button
            size="sm"
            variant="outline"
            nativeButton={false}
            render={<Link href={`/jobs/${currentJob.id}/edit`} />}
          >
            <Pencil />
            Edit
          </Button>
        </>
      }
      previewJob={currentJob}
    >
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-2">
          <JobStatusBadge
            status={currentJob.status}
            className="px-2.5 text-xs"
          />
          <span className="text-xs text-muted-foreground">
            Posted {currentJob.postedAt}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            label="Views"
            value={currentJob.viewCount ?? 0}
            icon={Eye}
          />
          <StatCard
            label="Applicants"
            value={currentJob.applicationCount ?? 0}
            icon={Users}
          />
          <StatCard
            label="Shares"
            value={currentJob.shareCount ?? 0}
            icon={Share2}
          />
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="font-heading text-base font-semibold">Applicants</h3>

          {error ? (
            <p className="text-sm text-destructive">
              {error instanceof Error
                ? error.message
                : "Could not load applicants"}
            </p>
          ) : (
            <div className="rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead>Applicant</TableHead>
                    <TableHead className="hidden md:table-cell">Applied</TableHead>
                    <TableHead className="hidden md:table-cell">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <ApplicantTableSkeleton />
                  ) : applications.length === 0 ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell
                        colSpan={3}
                        className="h-24 text-center text-sm text-muted-foreground"
                      >
                        No applications yet. Share your listing to reach crew on
                        AWN.
                      </TableCell>
                    </TableRow>
                  ) : (
                    applications.map((application) => (
                      <ApplicantTableRow
                        key={application.id}
                        application={application}
                        onSelect={handleSelectApplication}
                      />
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>

      {selectedApplication ? (
        <PersonProfileDrawer
          person={personFromApplication(selectedApplication)}
          open={drawerOpen}
          onOpenChange={handleDrawerOpenChange}
          footer={
            <JobApplicationReviewFooter
              application={selectedApplication}
              updating={isUpdating}
              onStatusChange={handleStatusChange}
              onAcceptWithMessage={handleAcceptWithMessage}
            />
          }
        />
      ) : null}
    </JobPageLayout>
  )
}
