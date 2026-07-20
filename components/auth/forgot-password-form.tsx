"use client"

import * as React from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Loader2, Mail } from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const RESET_NEXT = "/login/reset-password"

export function ForgotPasswordForm() {
  const [email, setEmail] = React.useState("")
  const [pending, setPending] = React.useState(false)
  const [sent, setSent] = React.useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setPending(true)
    try {
      const supabase = createClient()
      const origin = window.location.origin
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(RESET_NEXT)}`,
        },
      )
      if (error) {
        toast.error(error.message)
        return
      }
      setSent(true)
    } finally {
      setPending(false)
    }
  }

  if (sent) {
    return (
      <div className="grid gap-4 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
          <Mail className="size-6" />
        </div>
        <div className="grid gap-1">
          <h2 className="font-heading text-xl font-medium">Check your email</h2>
          <p className="text-sm text-muted-foreground text-pretty">
            If an account exists for{" "}
            <span className="font-medium text-foreground">{email.trim()}</span>,
            we sent a password reset link. Open it to choose a new password.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setSent(false)
            setEmail("")
          }}
        >
          Use a different email
        </Button>
        <Link
          href="/login"
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-1 text-center">
        <h2 className="font-heading text-xl font-medium">Reset your password</h2>
        <p className="text-sm text-muted-foreground text-pretty">
          Enter your email and we&apos;ll send you a link to set a new password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={pending}
          />
        </div>

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? (
            <>
              <Loader2 data-icon="inline-start" className="animate-spin" />
              Sending link…
            </>
          ) : (
            "Send reset link"
          )}
        </Button>
      </form>

      <Link
        href="/login"
        className="text-center text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
      >
        Back to sign in
      </Link>
    </div>
  )
}
