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
}

export const APPLY_STEPS: ApplyFormStep[] = [
  { id: "account", title: "Create your account" },
  { id: "professional", title: "Professional info" },
  { id: "social", title: "Social links" },
]

export const REQUEST_ACCESS_STEPS = APPLY_STEPS

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
          completed: <Check aria-hidden="true" />,
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
