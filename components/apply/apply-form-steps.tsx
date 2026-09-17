"use client"

import { Check, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Stepper,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperSeparator,
  StepperTrigger,
} from "@/components/ui/stepper"

export type ApplyFormStep = {
  id: string
  title: string
  description: string
}

export const APPLY_STEPS: ApplyFormStep[] = [
  {
    id: "account",
    title: "Create your account",
    description:
      "Set a password for your AWN account. Your email is locked to this invite.",
  },
  {
    id: "professional",
    title: "Professional info",
    description:
      "Share your name, current role, and resume so our team can review your application.",
  },
  {
    id: "social",
    title: "Social links",
    description:
      "Add at least two links so admins can verify your online presence.",
  },
]

export const REQUEST_ACCESS_STEPS: ApplyFormStep[] = [
  {
    id: "account",
    title: "Create your account",
    description: "Enter the email you want on your AWN account and set a password.",
  },
  APPLY_STEPS[1],
  APPLY_STEPS[2],
]

const APPLY_FORM_STEPPER_STEPS = APPLY_STEPS.map(({ id }) => ({ id }))

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
  const isLastStep = currentStep === total - 1

  return (
    <div className="flex flex-col gap-5">
      <Stepper
        steps={APPLY_FORM_STEPPER_STEPS}
        value={steps[currentStep].id}
        indicators={{
          completed: <Check aria-hidden="true" className="scale-[0.8]" />,
        }}
        aria-label={`Application step ${currentStep + 1} of ${total}`}
      >
        <StepperNav>
          {steps.map((stepItem) => (
            <StepperItem key={stepItem.id} stepId={stepItem.id} disabled>
              <StepperTrigger tabIndex={-1} aria-disabled="true">
                <StepperIndicator variant="outline" className="rounded-full" />
              </StepperTrigger>
              <StepperSeparator />
            </StepperItem>
          ))}
        </StepperNav>
      </Stepper>

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
