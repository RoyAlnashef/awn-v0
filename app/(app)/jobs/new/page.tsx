import { redirect } from "next/navigation"

import { JobFormPage } from "@/components/jobs/job-form-page"
import { getSessionUser } from "@/lib/auth/get-session-user"

export default async function NewJobPage() {
  const sessionUser = await getSessionUser()
  if (!sessionUser) redirect("/login")

  return (
    <JobFormPage
      poster={{
        name: sessionUser.name,
        role: sessionUser.title,
        avatar: sessionUser.avatarUrl,
      }}
    />
  )
}
