import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export function SettingsSection({
  title,
  description,
  titleClassName,
  children,
}: {
  title: string
  description?: string
  titleClassName?: string
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-1">
      <div className="flex flex-col gap-0.5 pb-2">
        <h3 className={cn("font-heading text-base font-semibold", titleClassName)}>
          {title}
        </h3>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  )
}
