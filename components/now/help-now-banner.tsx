"use client"

import { cn } from "@/lib/utils"

export function HelpNowBanner({
  className,
  onOpenHelpNow,
}: {
  className?: string
  onOpenHelpNow: () => void
}) {
  return (
    <button
      type="button"
      onClick={onOpenHelpNow}
      className={cn(
        "flex w-full items-center gap-2 rounded-xl border border-amber-600/40 bg-amber-950/20 px-4 py-3 text-left text-sm text-foreground transition-colors hover:bg-amber-950/30 dark:border-amber-500/30 dark:bg-amber-950/40",
        className,
      )}
    >
      <span
        className="size-2 shrink-0 rounded-full bg-amber-600 dark:bg-amber-500"
        aria-hidden
      />
      <span>Help Now: 24-hr urgent callouts</span>
    </button>
  )
}
