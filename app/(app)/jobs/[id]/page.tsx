import { notFound, redirect } from "next/navigation"

import { JobManagementDetail } from "@/components/jobs/job-management-detail"
import { getSessionUser } from "@/lib/auth/get-session-user"
import { getJobForManagement } from "@/lib/jobs/server"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function JobManagementPage({ params }: PageProps) {
  const sessionUser = await getSessionUser()
  if (!sessionUser) redirect("/login")

  const { id } = await params
  const job = await getJobForManagement(id, sessionUser.id)
  if (!job) notFound()

  return <JobManagementDetail job={job} />
}
