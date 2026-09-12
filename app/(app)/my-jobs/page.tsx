import { redirect } from "next/navigation"

import { getSessionUser } from "@/lib/auth/get-session-user"

export default async function MyJobsPage() {
  const sessionUser = await getSessionUser()
  if (sessionUser?.canPostJobs) {
    redirect("/my-jobs/created")
  }
  redirect("/my-jobs/saved")
}
