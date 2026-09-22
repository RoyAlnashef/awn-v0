"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"

import { AuthShell } from "@/components/auth/auth-shell"
import { applicationStatusConfig } from "@/lib/invites/data"
import { signOut } from "@/lib/auth/sign-out"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function PendingStatus({
  application,
}: {
  application: {
    status: keyof typeof applicationStatusConfig
    fullName: string
    email: string
    title: string
    adminNote: string | null
    createdAt: string
    reviewedAt: string | null
  }
}) {
  const router = useRouter()
  const status = applicationStatusConfig[application.status]

  async function handleSignOut() {
    await signOut()
    router.push("/login")
    router.refresh()
  }

  return (
    <AuthShell showAppIcon subtitle="Your membership application status">
      <div className="grid gap-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">{application.fullName}</p>
            <p className="text-xs text-muted-foreground">{application.email}</p>
          </div>
          <Badge variant="outline" className={cn("border", status.className)}>
            {status.label}
          </Badge>
        </div>

        <div className="rounded-xl border bg-muted/20 p-4 text-sm">
          <p className="font-medium">{application.title}</p>
          <p className="mt-2 text-muted-foreground">
            {application.status === "pending"
              ? "Our team is reviewing your application. We'll email you when there's an update."
              : application.status === "approved"
                ? "You're approved. Sign in to access AWN."
                : "Your application was not approved at this time."}
          </p>

          {application.adminNote ? (
            <p className="mt-3 rounded-lg border bg-background/60 p-3 text-muted-foreground">
              {application.adminNote}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          {application.status === "approved" ? (
            <Button render={<Link href="/login" />} className="flex-1">
              Sign in to AWN
            </Button>
          ) : null}
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => void handleSignOut()}
          >
            Sign out
          </Button>
        </div>
      </div>
    </AuthShell>
  )
}
