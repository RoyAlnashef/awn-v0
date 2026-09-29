import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function PageShell({
  title,
  description,
  breadcrumb,
  actions,
  children,
  fillViewport,
}: {
  title: string
  description?: string
  breadcrumb?: ReactNode
  actions?: ReactNode
  children?: ReactNode
  /** Pin page height to the viewport below the site header (matches Messages/Rooms). */
  fillViewport?: boolean
}) {
  return (
    <div
      className={cn(
        "flex flex-col",
        fillViewport
          ? "mx-auto flex h-[calc(100svh-4rem)] w-full max-w-350 min-w-0 flex-col gap-8 overflow-hidden px-4 py-8 md:px-6"
          : "mx-auto w-full max-w-350 min-w-0 flex-1 gap-8 px-4 py-8 md:px-6",
      )}
    >
      <div className="flex shrink-0 flex-col gap-8 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className={cn("flex flex-col", breadcrumb ? "gap-4" : "gap-2")}>
          {breadcrumb}
          <div className="flex flex-col gap-1">
            <h1 className="font-heading text-h3 font-semibold tracking-tight">
              {title}
            </h1>
            {description ? (
              <p className="text-body-sm text-muted-foreground text-pretty">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {actions ? (
          <div className="flex w-full min-w-0 shrink-0 items-start gap-2 sm:w-auto sm:items-center">
            {actions}
          </div>
        ) : null}
      </div>
      {children ? (
        fillViewport ? (
          <div className="flex min-h-0 flex-1 flex-col">{children}</div>
        ) : (
          children
        )
      ) : (
        <div className="flex min-h-[60vh] flex-1 items-center justify-center rounded-xl border border-dashed">
          <p className="text-sm text-muted-foreground">
            Page content coming next.
          </p>
        </div>
      )}
    </div>
  )
}
