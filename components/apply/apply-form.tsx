"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { AuthShell } from "@/components/auth/auth-shell"
import { SOCIAL_FIELD_ICONS } from "@/components/icons/social-brand-icons"
import { submitApplication } from "@/lib/applications/actions"
import { createClient } from "@/lib/supabase/client"
import { SOCIAL_FIELD_IDS, type SocialFieldId } from "@/lib/social-links"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const SOCIAL_LABELS: Record<SocialFieldId, string> = {
  website: "Website",
  instagram: "Instagram",
  twitter: "X / Twitter",
  linkedin: "LinkedIn",
  youtube: "YouTube",
}

export function ApplyForm({
  token,
  inviteeEmail,
  inviterName,
}: {
  token: string
  inviteeEmail: string
  inviterName: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [title, setTitle] = useState("")
  const [resume, setResume] = useState<File | null>(null)
  const [socials, setSocials] = useState<Record<SocialFieldId, string>>({
    website: "",
    instagram: "",
    twitter: "",
    linkedin: "",
    youtube: "",
  })

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()

    if (!resume) {
      toast.error("Upload your resume (PDF).")
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.set("token", token)
      formData.set("password", password)
      formData.set("fullName", fullName)
      formData.set("title", title)
      formData.set("resume", resume)

      for (const id of SOCIAL_FIELD_IDS) {
        const value = socials[id].trim()
        if (value) formData.set(id, value)
      }

      const result = await submitApplication(formData)
      if (!result.ok) {
        toast.error(result.error)
        return
      }

      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: inviteeEmail,
        password,
      })

      if (error) {
        toast.success("Application submitted. Sign in to check your status.")
        router.push("/login?next=/pending")
        return
      }

      toast.success("Application submitted")
      router.push("/pending")
      router.refresh()
    })
  }

  return (
    <AuthShell
      subtitle={`${inviterName} invited you to apply for AWN membership.`}
      footer="Membership is invite-only and reviewed manually by our team."
    >
      <form onSubmit={handleSubmit} className="grid gap-5">
        <div className="grid gap-2">
          <Label htmlFor="apply-email">Email</Label>
          <Input id="apply-email" value={inviteeEmail} readOnly disabled />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="apply-password">Password</Label>
          <Input
            id="apply-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            minLength={8}
            required
            autoComplete="new-password"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="apply-name">Full name</Label>
          <Input
            id="apply-name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            autoComplete="name"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="apply-title">Title / role</Label>
          <Input
            id="apply-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Monitor Engineer"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="apply-resume">Resume (PDF)</Label>
          <Input
            id="apply-resume"
            type="file"
            accept="application/pdf"
            required
            onChange={(e) => setResume(e.target.files?.[0] ?? null)}
          />
        </div>

        <div className="grid gap-3">
          <div>
            <p className="text-sm font-medium">Social links</p>
            <p className="text-xs text-muted-foreground">
              Add at least one link so admins can verify your online presence.
            </p>
          </div>

          {SOCIAL_FIELD_IDS.map((id) => {
            const Icon = SOCIAL_FIELD_ICONS[id]
            return (
              <div key={id} className="grid gap-1.5">
                <Label htmlFor={`apply-${id}`} className="flex items-center gap-2">
                  <Icon className="size-4" />
                  {SOCIAL_LABELS[id]}
                </Label>
                <Input
                  id={`apply-${id}`}
                  value={socials[id]}
                  onChange={(e) =>
                    setSocials((current) => ({ ...current, [id]: e.target.value }))
                  }
                  placeholder={
                    id === "linkedin"
                      ? "linkedin.com/in/username"
                      : id === "website"
                        ? "yoursite.com"
                        : "username or URL"
                  }
                />
              </div>
            )
          })}
        </div>

        <Button type="submit" disabled={isPending} className="w-full">
          {isPending ? "Submitting…" : "Submit application"}
        </Button>
      </form>
    </AuthShell>
  )
}
