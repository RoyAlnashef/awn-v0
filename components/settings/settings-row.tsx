import type { ReactNode } from "react"

export function SettingsRow({
  icon: Icon,
  label,
  description,
  value,
  badge,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  description?: string
  value?: string
  badge?: ReactNode
  action?: ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted">
          <Icon className="size-4 text-muted-foreground" />
        </div>
        <div className="flex flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">{label}</span>
            {badge}
          </div>
          {description ? (
            <span className="text-xs text-muted-foreground">{description}</span>
          ) : null}
          {value ? (
            <span className="text-xs text-foreground/70">{value}</span>
          ) : null}
        </div>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  )
}
