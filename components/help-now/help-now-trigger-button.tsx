"use client"

import type { VariantProps } from "class-variance-authority"

import { Button, buttonVariants } from "@/components/ui/button"
import { urgentDotStyles } from "@/lib/jobs/format"
import { cn } from "@/lib/utils"

export function HelpNowTriggerButton({
  onClick,
  className,
  size = "sm",
}: {
  onClick: () => void
  className?: string
  size?: VariantProps<typeof buttonVariants>["size"]
}) {
  return (
    <Button
      type="button"
      size={size}
      variant="outline"
      className={cn(
        "border-amber-600/40 text-amber-700 hover:bg-amber-600/10 hover:text-amber-800 dark:text-amber-500 dark:hover:text-amber-400",
        className,
      )}
      onClick={onClick}
    >
      <span
        className={cn("size-1.5 shrink-0 rounded-full", urgentDotStyles)}
        aria-hidden
      />
      Help Now
    </Button>
  )
}
