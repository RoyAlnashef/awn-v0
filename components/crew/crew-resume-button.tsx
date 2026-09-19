"use client"

import { FileDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function CrewResumeButton({
  handle,
  hasResume,
  onPrintResume,
  className,
  fullWidth = false,
}: {
  handle: string
  hasResume: boolean
  onPrintResume?: () => void
  className?: string
  fullWidth?: boolean
}) {
  function handleClick() {
    if (hasResume) {
      window.location.assign(`/api/crew/${encodeURIComponent(handle)}/resume`)
      return
    }

    onPrintResume?.()
  }

  return (
    <Button
      variant="default"
      size={fullWidth ? "lg" : "lg"}
      className={cn(fullWidth && "w-full", className)}
      onClick={handleClick}
    >
      <FileDown />
      Resume
    </Button>
  )
}
