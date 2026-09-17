"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

export type ApplyFormStep = {
  title: string
}

export const APPLY_STEPS: ApplyFormStep[] = [
  { title: "Create your account" },
  { title: "Professional info" },
  { title: "Social links" },
]

export const REQUEST_ACCESS_STEPS = APPLY_STEPS

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

      <h2 className="font-heading text-lg font-semibold tracking-tight">
        {step.title}
      </h2>

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
