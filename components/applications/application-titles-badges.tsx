import { parseApplicationTitles } from "@/lib/applications/titles"
import { Badge } from "@/components/ui/badge"

export function ApplicationTitlesBadges({ title }: { title: string }) {
  const roles = parseApplicationTitles(title)

  return (
    <div className="flex flex-wrap gap-1">
      {roles.map((role) => (
        <Badge key={role} variant="secondary">
          {role}
        </Badge>
      ))}
    </div>
  )
}
