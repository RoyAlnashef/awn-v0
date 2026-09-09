"use client"

import { SquareArrowOutUpRight } from "lucide-react"

import { openPopoutWindow } from "@/lib/popout"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function PopOutButton({
  href,
  windowName,
  "aria-label": ariaLabel,
}: {
  href: string
  windowName: string
  "aria-label": string
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              aria-label={ariaLabel}
              onClick={() => openPopoutWindow(href, windowName)}
            >
              <SquareArrowOutUpRight className="size-4" />
            </Button>
          }
        />
        <TooltipContent>Pop out</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
