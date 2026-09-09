import { PageShell } from "@/components/page-shell"
import { ProfileSettings } from "@/components/settings/profile-settings"
import { getSessionUser } from "@/lib/auth/get-session-user"

export default async function SettingsPage() {
  const user = await getSessionUser()

  return (
    <PageShell
      title="Settings"
      description="Manage your profile, availability, and account preferences."
    >
      {user ? (
        <ProfileSettings
          userId={user.id}
          name={user.name}
          avatarUrl={user.avatarUrl}
        />
      ) : null}
    </PageShell>
  )
}
