"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Mail, KeyRound, TriangleAlert, X } from "lucide-react"

import { AnimatedIcon } from "@/components/icons/animated-icon"
import { MailCheckIcon } from "@/components/ui/mail-check"

import { createClient } from "@/lib/supabase/client"
import { safeRedirectPath } from "@/lib/auth/safe-redirect"
import { SUSPENDED_ACCOUNT_MESSAGE } from "@/lib/auth/suspended-message"
import { PasswordField } from "@/components/auth/password-field"
import { cn } from "@/lib/utils"
import {
  Alert,
  AlertAction,
  AlertDescription,
} from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type Mode = "password" | "magic"

export function LoginForm({
  initialError,
}: {
  initialError?: string | null
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = safeRedirectPath(searchParams.get("next"))

  const [mode, setMode] = React.useState<Mode>("password")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [pending, setPending] = React.useState(false)
  const [magicSent, setMagicSent] = React.useState(false)
  const [accessNotice, setAccessNotice] = React.useState<string | null>(
    initialError ?? null,
  )

  React.useEffect(() => {
    if (initialError) {
      setAccessNotice(initialError)
    }
  }, [initialError])

  function dismissAccessNotice() {
    setAccessNotice(null)
    const params = new URLSearchParams(searchParams.toString())
    params.delete("error")
    const query = params.toString()
    router.replace(query ? `/login?${query}` : "/login", { scroll: false })
  }

  async function handlePasswordSubmit(event: React.FormEvent) {
    event.preventDefault()
    setPending(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      if (error) {
        toast.error(error.message)
        return
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("status")
          .eq("id", user.id)
          .maybeSingle()
        if (profile?.status === "suspended") {
          await supabase.auth.signOut()
          setAccessNotice(SUSPENDED_ACCOUNT_MESSAGE)
          return
        }
      }

      router.replace(next)
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  async function handleMagicSubmit(event: React.FormEvent) {
    event.preventDefault()
    setPending(true)
    try {
      const supabase = createClient()
      const origin = window.location.origin
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
          shouldCreateUser: false,
        },
      })
      if (error) {
        toast.error(error.message)
        return
      }
      setMagicSent(true)
      toast.success("Check your email for a sign-in link")
    } finally {
      setPending(false)
    }
  }

  if (magicSent) {
    return (
      <div className="grid gap-4 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/15 text-primary">
          <AnimatedIcon icon={MailCheckIcon} size={24} />
        </div>
        <div className="grid gap-1">
          <h2 className="font-heading text-xl font-medium">Check your email</h2>
          <p className="text-sm text-muted-foreground text-pretty">
            We sent a magic link to{" "}
            <span className="font-medium text-foreground">{email.trim()}</span>.
            Open it to finish signing in.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setMagicSent(false)
            setMode("magic")
          }}
        >
          Use a different email
        </Button>
        <button
          type="button"
          className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          onClick={() => {
            setMagicSent(false)
            setMode("password")
          }}
        >
          Sign in with password instead
        </button>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      {accessNotice ? (
        <Alert variant="warning">
          <TriangleAlert />
          <AlertDescription>{accessNotice}</AlertDescription>
          <AlertAction>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="text-current"
              aria-label="Dismiss"
              onClick={dismissAccessNotice}
            >
              <X />
            </Button>
          </AlertAction>
        </Alert>
      ) : null}

      <div
        role="tablist"
        aria-label="Sign-in method"
        className="grid grid-cols-2 gap-1 rounded-md border bg-muted/40 p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "password"}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm transition-colors",
            mode === "password"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
          onClick={() => setMode("password")}
        >
          <KeyRound className="size-3.5" />
          Password
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "magic"}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm transition-colors",
            mode === "magic"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
          onClick={() => setMode("magic")}
        >
          <Mail className="size-3.5" />
          Magic link
        </button>
      </div>

      <form
        onSubmit={mode === "password" ? handlePasswordSubmit : handleMagicSubmit}
        className="grid gap-4"
      >
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

        {mode === "password" ? (
          <PasswordField
            id="password"
            label="Password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            disabled={pending}
            labelExtra={
              <Link
                href="/login/forgot-password"
                className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Forgot password?
              </Link>
            }
          />
        ) : (
          <p className="text-sm text-muted-foreground text-pretty">
            We’ll email you a one-time link. No password needed.
          </p>
        )}

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? (
            <>
              <Loader2 data-icon="inline-start" className="animate-spin" />
              {mode === "password" ? "Signing in…" : "Sending link…"}
            </>
          ) : mode === "password" ? (
            "Sign in"
          ) : (
            "Send magic link"
          )}
        </Button>
      </form>
    </div>
  )
}
