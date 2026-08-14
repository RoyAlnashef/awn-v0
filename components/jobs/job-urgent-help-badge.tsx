import { urgentBadgeStyles } from "@/lib/jobs/format"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export function JobUrgentHelpBadge({ className }: { className?: string }) {
  return (
    <Badge variant="outline" className={cn(urgentBadgeStyles, className)}>
      Urgent Help
    </Badge>
  )
}
