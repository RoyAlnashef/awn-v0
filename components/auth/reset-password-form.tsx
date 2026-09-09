"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { PasswordField } from "@/components/auth/password-field"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

const MIN_PASSWORD_LENGTH = 8

function isSamePasswordError(error: { code?: string; message?: string }) {
  return (
    error.code === "same_password" ||
    error.message?.toLowerCase().includes("different from the old password") ===
      true
  )
}

export function ResetPasswordForm() {
  const router = useRouter()
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [pending, setPending] = React.useState(false)

  function finishReset(message: string) {
    toast.success(message)
    router.replace("/now")
    router.refresh()
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (password.length < MIN_PASSWORD_LENGTH) {
      toast.error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.")
      return
    }

    setPending(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        if (isSamePasswordError(error)) {
          finishReset("You're signed in.")
          return
        }
        toast.error(error.message)
        return
      }
      finishReset("Password updated. You're signed in.")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-1 text-center">
        <h2 className="font-heading text-xl font-medium">Set your password</h2>
        <p className="text-sm text-muted-foreground text-pretty">
          Enter your password below. You can reuse a previous password if you
          prefer.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <PasswordField
          id="password"
          label="Password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          disabled={pending}
        />

        <PasswordField
          id="confirm-password"
          label="Confirm password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
          minLength={MIN_PASSWORD_LENGTH}
          disabled={pending}
        />

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? (
            <>
              <Loader2 data-icon="inline-start" className="animate-spin" />
              Updating…
            </>
          ) : (
            "Continue"
          )}
        </Button>
      </form>
    </div>
  )
}
