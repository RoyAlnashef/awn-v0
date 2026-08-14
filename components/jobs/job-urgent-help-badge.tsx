import { TriangleAlert } from "lucide-react"

import { urgentBadgeStyles } from "@/lib/jobs/format"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export function JobUrgentHelpBadge({ className }: { className?: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("gap-1 font-normal", urgentBadgeStyles, className)}
    >
      <TriangleAlert className="size-3" />
      Urgent
    </Badge>
  )
}
