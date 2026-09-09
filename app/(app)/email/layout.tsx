import { redirect } from "next/navigation"

import { getSessionUser } from "@/lib/auth/get-session-user"

export default async function EmailLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const sessionUser = await getSessionUser()
  if (!sessionUser?.canAccessAdmin) {
    redirect("/now")
  }

  return children
}
