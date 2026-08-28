"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export type ApplyFormStep = {
  title: string
  description: string
}

export const APPLY_STEPS: ApplyFormStep[] = [
  {
    title: "Create your account",
    description:
      "Set a password for your AWN account. Your email is locked to this invite.",
  },
  {
    title: "Professional info",
    description:
      "Share your name and current role so our team can review your application. You can optionally include a resume.",
  },
  {
    title: "Social links",
    description:
      "Add at least two links so admins can verify your online presence.",
  },
]

export const REQUEST_ACCESS_STEPS: ApplyFormStep[] = [
  {
    title: "Create your account",
    description: "Enter the email you want on your AWN account and set a password.",
  },
  APPLY_STEPS[1],
  APPLY_STEPS[2],
]

export function ApplyFormSteps({
  currentStep,
  onBack,
  onContinue,
  isPending,
  steps = APPLY_STEPS,
  children,
}: {
  currentStep: number
  onBack: () => void
  onContinue: () => void
  isPending?: boolean
  steps?: readonly ApplyFormStep[]
  children: React.ReactNode
}) {
  const total = steps.length
  const step = steps[currentStep]
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
