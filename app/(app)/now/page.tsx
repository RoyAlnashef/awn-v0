import { NowView } from "@/components/now/now-view"
import { getSessionUser } from "@/lib/auth/get-session-user"
import {
  firstNameFromFullName,
  formatNowGreeting,
} from "@/lib/now/greeting"
import { mainNav } from "@/lib/nav"

const now = mainNav.find((item) => item.href === "/now")!

export default async function NowPage() {
  const sessionUser = await getSessionUser()
  const firstName = firstNameFromFullName(sessionUser?.name ?? "Member")
  const greeting = formatNowGreeting(firstName)

  return <NowView greeting={greeting} description={now.description} />
}
