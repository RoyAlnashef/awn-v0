import { urgentBadgeStyles } from "@/lib/jobs/format"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

function HelpNowPulseDot({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative flex size-2 shrink-0 items-center justify-center",
        className,
      )}
      aria-hidden
    >
      <span className="absolute inline-flex size-full animate-ping rounded-full bg-amber-500 opacity-75" />
      <span className="relative inline-flex size-1.5 rounded-full bg-amber-600 dark:bg-amber-500" />
    </span>
  )
}

export function JobUrgentHelpBadge({ className }: { className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("gap-1.5 font-normal", urgentBadgeStyles, className)}
    >
      <HelpNowPulseDot />
      Help Now
    </Badge>
  )
}
