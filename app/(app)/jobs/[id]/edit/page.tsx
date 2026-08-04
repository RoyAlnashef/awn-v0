import { notFound, redirect } from "next/navigation"

import { JobFormPage } from "@/components/jobs/job-form-page"
import { getSessionUser } from "@/lib/auth/get-session-user"
import { getJobForManagement } from "@/lib/jobs/server"

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function EditJobPage({ params }: PageProps) {
  const sessionUser = await getSessionUser()
  if (!sessionUser) redirect("/login")

  const { id } = await params
  const job = await getJobForManagement(id, sessionUser.id)
  if (!job) notFound()

  return (
    <JobFormPage
      job={job}
      poster={{
        name: sessionUser.name,
        role: sessionUser.title,
        avatar: sessionUser.avatarUrl,
      }}
    />
  )
}
