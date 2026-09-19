import { AccountSettingsSection } from "@/components/settings/account-settings-section"
import { getSessionUser } from "@/lib/auth/get-session-user"

export default async function SettingsAccountPage() {
  const user = await getSessionUser()

  return <AccountSettingsSection email={user?.email} />
}
