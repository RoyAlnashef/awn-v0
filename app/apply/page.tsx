import { AuthShell } from "@/components/auth/auth-shell"
import { ApplyForm } from "@/components/apply/apply-form"
import { getInviteByToken } from "@/lib/invites/actions"

export default async function ApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const params = await searchParams
  const token = params.token?.trim() ?? ""

  if (!token) {
    return (
      <AuthShell subtitle="This invite link is missing a token.">
        <p className="text-sm text-muted-foreground">
          Ask the member who invited you to resend their invite email.
        </p>
      </AuthShell>
    )
  }

  const result = await getInviteByToken(token)

  if (!result.ok) {
    return (
      <AuthShell subtitle="This invite link isn't valid.">
        <p className="text-sm text-muted-foreground">{result.error}</p>
      </AuthShell>
    )
  }

  return (
    <ApplyForm
      token={token}
      inviteeEmail={result.invite.inviteeEmail}
      inviterName={result.invite.inviterName}
    />
  )
}
