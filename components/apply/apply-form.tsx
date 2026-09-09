"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import {
  APPLY_STEPS,
  ApplyFormSteps,
  REQUEST_ACCESS_STEPS,
} from "@/components/apply/apply-form-steps"
import { AuthShell } from "@/components/auth/auth-shell"
import { PasswordField } from "@/components/auth/password-field"
import { SOCIAL_FIELD_ICONS } from "@/components/icons/social-brand-icons"
import {
  submitApplication,
  submitRequestAccessApplication,
} from "@/lib/applications/actions"
import { createClient } from "@/lib/supabase/client"
import {
  hasMinimumSocialLinks,
  SOCIAL_FIELD_IDS,
  type SocialFieldId,
} from "@/lib/social-links"
import { isValidEmail } from "@/lib/validation/email"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const MIN_PASSWORD_LENGTH = 8

const SOCIAL_LABELS: Record<SocialFieldId, string> = {
  website: "Website",
  instagram: "Instagram",
  facebook: "Facebook",
  twitter: "X / Twitter",
  linkedin: "LinkedIn",
  youtube: "YouTube",
}

type ApplyFormProps =
  | {
      mode: "invite"
      token: string
      inviteeEmail: string
      inviterName: string
    }
  | {
      mode: "request_access"
    }

export function ApplyForm(props: ApplyFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [currentStep, setCurrentStep] = useState(0)
  const [email, setEmail] = useState(
    props.mode === "invite" ? props.inviteeEmail : "",
  )
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [title, setTitle] = useState("")
  const [resume, setResume] = useState<File | null>(null)
  const [socials, setSocials] = useState<Record<SocialFieldId, string>>({
    website: "",
    instagram: "",
    facebook: "",
    twitter: "",
    linkedin: "",
    youtube: "",
  })

  const isRequestAccess = props.mode === "request_access"
  const steps = isRequestAccess ? REQUEST_ACCESS_STEPS : APPLY_STEPS
  const signInEmail = isRequestAccess ? email.trim().toLowerCase() : props.inviteeEmail

  function validateCredentials(): boolean {
    if (isRequestAccess) {
      const normalizedEmail = email.trim().toLowerCase()
      if (!normalizedEmail) {
        toast.error("Email is required.")
        return false
      }
      if (!isValidEmail(normalizedEmail)) {
        toast.error("Enter a valid email address.")
        return false
      }
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      toast.error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return false
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.")
      return false
    }
    return true
  }

  function validateProfessionalInfo(): boolean {
    if (!fullName.trim()) {
      toast.error("Full name is required.")
      return false
    }
    if (!title.trim()) {
      toast.error("Title is required.")
      return false
    }
    if (!resume) {
      toast.error("Resume is required.")
      return false
    }
    return true
  }

  function validateSocialLinks(): boolean {
    if (!hasMinimumSocialLinks(socials)) {
      toast.error("Add at least two social links so admins can verify you.")
      return false
    }
    return true
  }

  function handleContinue() {
    if (currentStep === 0) {
      if (!validateCredentials()) return
      setCurrentStep(1)
      return
    }

    if (currentStep === 1) {
      if (!validateProfessionalInfo()) return
      setCurrentStep(2)
      return
    }

    if (!validateSocialLinks()) return
    submitForm()
  }

  function handleBack() {
    setCurrentStep((step) => Math.max(0, step - 1))
  }

  function submitForm() {
    startTransition(async () => {
      if (!resume) {
        toast.error("Resume is required.")
        return
      }

      const formData = new FormData()
      formData.set("password", password)
      formData.set("fullName", fullName)
      formData.set("title", title)
      formData.set("resume", resume)

      if (isRequestAccess) {
        formData.set("email", signInEmail)
      } else {
        formData.set("token", props.token)
      }

      for (const id of SOCIAL_FIELD_IDS) {
        const value = socials[id].trim()
        if (value) formData.set(id, value)
      }

      const result = isRequestAccess
        ? await submitRequestAccessApplication(formData)
        : await submitApplication(formData)

      if (!result.ok) {
        toast.error(result.error)
        return
      }

      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({
        email: signInEmail,
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
      subtitle={
        isRequestAccess
          ? "Apply for AWN membership. Every application is reviewed by hand."
          : `${props.inviterName} invited you to apply for AWN membership.`
      }
      footer="Membership is invite-only and reviewed manually by our team."
    >
      <ApplyFormSteps
        currentStep={currentStep}
        onBack={handleBack}
        onContinue={handleContinue}
        isPending={isPending}
        steps={steps}
      >
        {currentStep === 0 ? (
          <div className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="apply-email">Email</Label>
              {isRequestAccess ? (
                <Input
                  id="apply-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  disabled={isPending}
                />
              ) : (
                <Input id="apply-email" value={email} readOnly disabled />
              )}
            </div>

            <PasswordField
              id="apply-password"
              label="Password"
              value={password}
              onChange={setPassword}
              autoComplete="new-password"
              minLength={MIN_PASSWORD_LENGTH}
              disabled={isPending}
              required={false}
            />

            <PasswordField
              id="apply-confirm-password"
              label="Confirm password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
              minLength={MIN_PASSWORD_LENGTH}
              disabled={isPending}
              required={false}
            />
          </div>
        ) : null}

        {currentStep === 1 ? (
          <div className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="apply-name">Full name</Label>
              <Input
                id="apply-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
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
          </div>
        ) : null}

        {currentStep === 2 ? (
          <div className="flex flex-col gap-3">
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
        ) : null}
      </ApplyFormSteps>
    </AuthShell>
  )
}
