import type { ReactNode } from "react"

export function PageShell({
  title,
  description,
  breadcrumb,
  actions,
  children,
}: {
  title: string
  description?: string
  breadcrumb?: ReactNode
  actions?: ReactNode
  children?: ReactNode
}) {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          {breadcrumb}
          <div className="flex flex-col gap-1">
            <h1 className="font-heading text-2xl font-semibold tracking-tight">
              {title}
            </h1>
            {description ? (
              <p className="text-sm text-muted-foreground text-pretty">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {actions ? (
          <div className="flex shrink-0 items-center gap-2">{actions}</div>
        ) : null}
      </div>
      {children ?? (
        <div className="flex min-h-[60vh] flex-1 items-center justify-center rounded-xl border border-dashed">
          <p className="text-sm text-muted-foreground">
            Page content coming next.
          </p>
        </div>
      )}
    </div>
  )
}
