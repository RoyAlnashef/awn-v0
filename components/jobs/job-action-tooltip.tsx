"use client"

import type { ReactElement, ReactNode } from "react"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function JobActionTooltips({ children }: { children: ReactNode }) {
  return <TooltipProvider delay={400}>{children}</TooltipProvider>
}

export function JobActionTooltip({
  label,
  children,
  wrap = false,
}: {
  label: string
  children: ReactElement | ReactNode
  wrap?: boolean
}) {
  const trigger = wrap ? (
    <span className="inline-flex">{children}</span>
  ) : (
    (children as ReactElement)
  )

  return (
    <Tooltip>
      <TooltipTrigger render={trigger} />
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
