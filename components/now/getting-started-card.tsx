"use client"

import * as React from "react"
import Link from "next/link"
import { Check } from "lucide-react"
import { toast } from "sonner"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress, ProgressLabel } from "@/components/ui/progress"
import { checklistItems, type ChecklistItemId } from "@/lib/now/now-data"
import { dismissOnboarding } from "@/lib/onboarding/actions"
import type { OnboardingStatus } from "@/lib/onboarding/progress"
import { useRoomsList } from "@/lib/rooms/hooks/use-rooms-list"
import { cn } from "@/lib/utils"

function StepStatusIcon({
  completed,
  highlighted,
}: {
  completed: boolean
  highlighted?: boolean
}) {
  if (completed) {
    return (
      <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
        <Check className="size-3" aria-hidden />
      </span>
    )
  }

  return (
    <span
      className={cn(
        "mt-0.5 size-4 shrink-0 rounded-full border border-dashed",
        highlighted ? "border-primary/70" : "border-muted-foreground/50",
      )}
      aria-hidden
    />
  )
}

function ItemCta({
  id,
  onOpenHelpNow,
}: {
  id: ChecklistItemId
  onOpenHelpNow?: () => void
}) {
  switch (id) {
    case "profile":
      return (
        <Button
          nativeButton={false}
          render={<Link href="/account" />}
          variant="default"
          className="mt-4"
        >
          Edit profile
        </Button>
      )
    case "join-group":
      return (
        <Button
          nativeButton={false}
          render={<Link href="/groups" />}
          variant="default"
          className="mt-4"
        >
          Browse groups
        </Button>
      )
    case "connect":
      return (
        <Button
          nativeButton={false}
          render={<Link href="/people" />}
          variant="default"
          className="mt-4"
        >
          Find members
        </Button>
      )
    case "invite":
      return (
        <Button
          nativeButton={false}
          render={<Link href="/people" />}
          variant="default"
          className="mt-4"
        >
          Send an invite
        </Button>
      )
    case "help-now":
      return (
        <Button
          type="button"
          variant="default"
          className="mt-4"
          onClick={() => onOpenHelpNow?.()}
        >
          Post Help Now
        </Button>
      )
    case "create-job":
      return (
        <Button
          nativeButton={false}
          render={<Link href="/jobs/new" />}
          variant="default"
          className="mt-4"
        >
          Create a job
        </Button>
      )
    case "apply-job":
      return (
        <Button
          nativeButton={false}
          render={<Link href="/jobs" />}
          variant="default"
          className="mt-4"
        >
          Browse jobs
        </Button>
      )
  }
}

export function GettingStartedCard({
  className,
  onOpenHelpNow,
  onVisibilityChange,
  initialStatus,
  initialDismissed = false,
  helpNowPosted = false,
}: {
  className?: string
  onOpenHelpNow?: () => void
  onVisibilityChange?: (visible: boolean) => void
  initialStatus: OnboardingStatus
  initialDismissed?: boolean
  helpNowPosted?: boolean
}) {
  const { rooms } = useRoomsList()
  const joinedGroupLive = rooms.some((room) => room.joined)

  const [dismissed, setDismissed] = React.useState(initialDismissed)
  const [isDismissing, startDismiss] = React.useTransition()

  // Merge server-derived status with live same-page signals (join a group,
  // post Help Now) so those items tick without a full reload.
  const status: OnboardingStatus = {
    ...initialStatus,
    "join-group": initialStatus["join-group"] || joinedGroupLive,
    "help-now": initialStatus["help-now"] || helpNowPosted,
  }

  const completedCount = checklistItems.reduce(
    (count, item) => count + (status[item.id] ? 1 : 0),
    0,
  )
  const total = checklistItems.length
  const progressValue = Math.round((completedCount / total) * 100)

  const firstIncomplete = checklistItems.find((item) => !status[item.id])?.id
  const defaultOpen = firstIncomplete ? [firstIncomplete] : []

  function handleDismiss() {
    setDismissed(true)
    onVisibilityChange?.(false)
    startDismiss(async () => {
      const result = await dismissOnboarding()
      if (!result.ok) {
        setDismissed(false)
        onVisibilityChange?.(true)
        toast.error(result.error)
      }
    })
  }

  if (dismissed) return null

  return (
    <Card className={cn("min-w-0", className)}>
      <CardHeader>
        <CardTitle>Getting started</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Progress value={progressValue}>
          <ProgressLabel>
            {completedCount} of {total} complete
          </ProgressLabel>
        </Progress>

        <Accordion defaultValue={defaultOpen}>
          {checklistItems.map((item) => {
            const completed = status[item.id]

            return (
              <AccordionItem key={item.id} value={item.id}>
                <AccordionTrigger className="items-start gap-3 py-3">
                  <StepStatusIcon
                    completed={completed}
                    highlighted={item.highlighted}
                  />
                  <span
                    className={cn(
                      "font-medium",
                      completed && "text-muted-foreground line-through",
                    )}
                  >
                    {item.title}
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pl-7">
                  <p className="text-muted-foreground">{item.description}</p>
                  {completed ? null : (
                    <ItemCta id={item.id} onOpenHelpNow={onOpenHelpNow} />
                  )}
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>

        <div className="flex justify-center pt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            disabled={isDismissing}
            onClick={handleDismiss}
          >
            Skip this
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
