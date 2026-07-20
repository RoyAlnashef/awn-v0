import { redirect } from "next/navigation"

import { getSessionUser } from "@/lib/auth/get-session-user"

export default async function RootPage() {
  const user = await getSessionUser()
  redirect(user ? "/now" : "/login")
}
