"use client"

import Link from "next/link"

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
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Progress,
  ProgressIndicator,
  ProgressLabel,
  ProgressTrack,
} from "@/components/ui/progress"
import { checklistItems } from "@/lib/now/now-data"
import { cn } from "@/lib/utils"

function StepStatusIcon({ highlighted }: { highlighted?: boolean }) {
  return (
    <span
      className={cn(
        "mt-0.5 size-4 shrink-0 rounded-full border border-dashed",
        highlighted ? "border-amber-600/70 dark:border-amber-500/70" : "border-muted-foreground/50",
      )}
      aria-hidden
    />
  )
}

export function GettingStartedCard({
  className,
  onOpenHelpNow,
}: {
  className?: string
  onOpenHelpNow?: () => void
}) {
  const currentStep = 1
  const progressValue = Math.round((currentStep / checklistItems.length) * 100)

  return (
    <Card className={cn("min-w-0", className)}>
        <CardHeader>
          <CardTitle>Getting started</CardTitle>
          <CardDescription>
            A few things left before you&apos;re fully set up.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Progress value={progressValue}>
            <ProgressLabel>Step {currentStep} of {checklistItems.length}</ProgressLabel>
            <ProgressTrack className="h-1.5">
              <ProgressIndicator className="bg-amber-600 dark:bg-amber-500" />
            </ProgressTrack>
          </Progress>

          <Accordion defaultValue={["profile"]} className="rounded-xl">
            {checklistItems.map((item) => (
              <AccordionItem
                key={item.id}
                value={item.id}
                className={cn(item.highlighted && "border-amber-600/30 dark:border-amber-500/30")}
              >
                <AccordionTrigger className="items-start gap-3 py-3">
                  <StepStatusIcon highlighted={item.highlighted} />
                  <span className="font-medium">{item.title}</span>
                </AccordionTrigger>
                <AccordionContent className="pl-7">
                  <p className="text-muted-foreground">{item.description}</p>
                  {item.id === "profile" ? (
                    <Button render={<Link href="/account" />} className="mt-4 rounded-full">
                      Complete profile
                    </Button>
                  ) : null}
                  {item.id === "invite" ? (
                    <Button
                      render={<Link href="/invites" />}
                      variant="outline"
                      className="mt-4 rounded-full"
                    >
                      Invite someone
                    </Button>
                  ) : null}
                  {item.id === "help-now" ? (
                    <Button
                      type="button"
                      variant="outline"
                      className="mt-4 rounded-full"
                      onClick={() => onOpenHelpNow?.()}
                    >
                      Post Help Now
                    </Button>
                  ) : null}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
  )
}
