"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export const APPLY_STEPS = [
  {
    title: "Create your account",
    description:
      "Set a password for your AWN account. Your email is locked to this invite.",
  },
  {
    title: "Professional info",
    description:
      "Share your name, current role, and resume so our team can review your application.",
  },
  {
    title: "Social links",
    description:
      "Add at least two links so admins can verify your online presence.",
  },
] as const

export function ApplyFormSteps({
  currentStep,
  onBack,
  onContinue,
  isPending,
  children,
}: {
  currentStep: number
  onBack: () => void
  onContinue: () => void
  isPending?: boolean
  children: React.ReactNode
}) {
  const total = APPLY_STEPS.length
  const step = APPLY_STEPS[currentStep]
  const percent = ((currentStep + 1) / total) * 100
  const isLastStep = currentStep === total - 1

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            Step {currentStep + 1} of {total}
          </span>
          <span className="text-muted-foreground tabular-nums">
            {Math.round(percent)}%
          </span>
        </div>
        <Progress value={percent} className="mt-3" />
      </div>

      <div>
        <h2 className="font-heading text-lg font-semibold tracking-tight">
          {step.title}
        </h2>
        <p className="mt-2 text-sm text-pretty text-muted-foreground">
          {step.description}
        </p>
      </div>

      {children}

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={currentStep === 0 || isPending}
        >
          <ChevronLeft data-icon="inline-start" aria-hidden="true" />
          Back
        </Button>
        <Button type="button" onClick={onContinue} disabled={isPending}>
          {isPending ? (
            "Submitting…"
          ) : isLastStep ? (
            "Submit application"
          ) : (
            "Continue"
          )}
          {!isPending && !isLastStep ? (
            <ChevronRight data-icon="inline-end" aria-hidden="true" />
          ) : null}
        </Button>
      </div>
    </div>
  )
}
