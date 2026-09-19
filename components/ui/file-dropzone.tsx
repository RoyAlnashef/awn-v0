"use client"

import * as React from "react"
import { UploadIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Spinner } from "@/components/ui/spinner"

export type FileDropzoneState = "idle" | "uploading" | "error"

export type FileDropzoneProps = {
  accept?: string
  hint?: string
  state?: FileDropzoneState
  uploadingFileName?: string
  errorMessage?: string
  onFileSelect: (file: File) => void
  disabled?: boolean
  variant?: "default" | "compact"
  idleLabel?: string
  compactLabel?: string
  className?: string
  inputRef?: React.RefObject<HTMLInputElement | null>
}

export function FileDropzone({
  accept = "application/pdf",
  hint,
  state = "idle",
  uploadingFileName,
  errorMessage,
  onFileSelect,
  disabled = false,
  variant = "default",
  idleLabel = "Drag & drop or choose file to upload",
  compactLabel = "Drag & drop to replace, or choose file",
  className,
  inputRef,
}: FileDropzoneProps) {
  const internalInputRef = React.useRef<HTMLInputElement>(null)
  const fileInputRef = inputRef ?? internalInputRef
  const [isDragging, setIsDragging] = React.useState(false)
  const isDisabled = disabled || state === "uploading"

  const handleFile = React.useCallback(
    (file: File | undefined) => {
      if (!file || isDisabled) return
      onFileSelect(file)
    },
    [isDisabled, onFileSelect],
  )

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    handleFile(file)
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    if (isDisabled) return
    setIsDragging(true)
  }

  function handleDragLeave(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    if (isDisabled) return
    handleFile(event.dataTransfer.files?.[0])
  }

  function openFilePicker() {
    if (isDisabled) return
    fileInputRef.current?.click()
  }

  const label =
    variant === "compact" && state === "idle" ? compactLabel : idleLabel

  return (
    <div className={cn("relative", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        className="sr-only"
        disabled={isDisabled}
        onChange={handleInputChange}
      />

      <div
        role="button"
        tabIndex={isDisabled ? -1 : 0}
        aria-disabled={isDisabled}
        aria-busy={state === "uploading"}
        onClick={openFilePicker}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            openFilePicker()
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          "flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed bg-card text-center transition-colors",
          variant === "default"
            ? "gap-2 px-6 py-10"
            : "gap-1 px-4 py-3 sm:flex-row sm:justify-center sm:gap-2",
          state === "error"
            ? "border-destructive/40"
            : isDragging
              ? "border-primary bg-muted/30"
              : "border-border hover:bg-muted/20",
          isDisabled && "pointer-events-none opacity-70",
        )}
      >
        {state === "uploading" ? (
          <>
            <Spinner className="size-5" />
            <p className="text-sm font-medium">
              Uploading{uploadingFileName ? ` ${uploadingFileName}` : "…"}
            </p>
            {hint ? (
              <p className="text-xs text-muted-foreground">{hint}</p>
            ) : null}
          </>
        ) : state === "error" ? (
          <>
            <UploadIcon className="size-5 text-destructive" />
            <p className="text-sm font-medium">{label}</p>
            {errorMessage ? (
              <p className="text-xs text-destructive/80">{errorMessage}</p>
            ) : null}
            {hint ? (
              <p className="text-xs text-muted-foreground">{hint}</p>
            ) : null}
          </>
        ) : (
          <>
            <UploadIcon
              className={cn(
                "text-muted-foreground",
                variant === "default" ? "size-6" : "size-4",
              )}
            />
            <p
              className={cn(
                "font-medium",
                variant === "default" ? "text-sm" : "text-xs sm:text-sm",
              )}
            >
              {label}
            </p>
            {hint ? (
              <p className="text-xs text-muted-foreground">{hint}</p>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
