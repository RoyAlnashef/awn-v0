"use client"

import { FileDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function CrewResumeButton({
  onPrintResume,
  className,
  fullWidth = false,
}: {
  onPrintResume: () => void
  className?: string
  fullWidth?: boolean
}) {
  return (
    <Button
      variant="default"
      size={fullWidth ? "lg" : "lg"}
      className={cn(fullWidth && "w-full", className)}
      onClick={onPrintResume}
    >
      <FileDown />
      Resume
    </Button>
  )
}
