"use client"

import { useRef, useState } from "react"
import { ImagePlusIcon, XIcon } from "lucide-react"

import { Spinner } from "@/components/ui/spinner"
import {
  FEEDBACK_ACCEPTED_IMAGE_TYPES,
  FEEDBACK_LIMITS,
} from "@/lib/feedback/types"
import { cn } from "@/lib/utils"

export type DraftAttachment = {
  id: string
  file: File
  previewUrl: string
}

export function FeedbackAttachments({
  attachments,
  processing,
  error,
  onAddFiles,
  onRemove,
  disabled,
}: {
  attachments: DraftAttachment[]
  processing: boolean
  error?: string
  onAddFiles: (files: File[]) => void
  onRemove: (id: string) => void
  disabled?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const remaining = FEEDBACK_LIMITS.maxAttachments - attachments.length
  const isFull = remaining <= 0

  function openPicker() {
    if (disabled || isFull) return
    inputRef.current?.click()
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium" id="feedback-attachments-label">
          Screenshots
          <span className="ml-1 font-normal text-muted-foreground">
            (optional)
          </span>
        </span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {attachments.length}/{FEEDBACK_LIMITS.maxAttachments}
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={FEEDBACK_ACCEPTED_IMAGE_TYPES.join(",")}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
        onChange={(event) => {
          const files = Array.from(event.target.files ?? [])
          event.target.value = ""
          if (files.length) onAddFiles(files)
        }}
      />

      <div
        role="group"
        aria-labelledby="feedback-attachments-label"
        className="grid grid-cols-5 gap-2"
      >
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
          >
            <img
              src={attachment.previewUrl || "/placeholder.svg"}
              alt={attachment.file.name}
              className="size-full object-cover"
            />
            <button
              type="button"
              onClick={() => onRemove(attachment.id)}
              disabled={disabled}
              className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-background/90 text-foreground opacity-100 shadow-sm transition-opacity focus-visible:opacity-100 focus-visible:outline-2 focus-visible:outline-ring sm:opacity-0 sm:group-hover:opacity-100"
            >
              <XIcon className="size-3" aria-hidden />
              <span className="sr-only">Remove {attachment.file.name}</span>
            </button>
          </div>
        ))}

        {processing ? (
          <div className="flex aspect-square items-center justify-center rounded-lg border border-dashed bg-muted/30">
            <Spinner className="size-4" />
            <span className="sr-only">Processing image…</span>
          </div>
        ) : null}

        {!isFull ? (
          <button
            type="button"
            onClick={openPicker}
            disabled={disabled}
            onDragOver={(event) => {
              event.preventDefault()
              setIsDragging(true)
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(event) => {
              event.preventDefault()
              setIsDragging(false)
              const files = Array.from(event.dataTransfer.files ?? [])
              if (files.length) onAddFiles(files)
            }}
            className={cn(
              "flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed text-muted-foreground transition-colors outline-none hover:bg-muted/40 hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50",
              attachments.length === 0 && !processing
                ? "col-span-5 flex-row py-4"
                : "aspect-square",
              isDragging && "border-primary bg-muted/40 text-foreground",
            )}
          >
            <ImagePlusIcon className="size-4" aria-hidden />
            {attachments.length === 0 && !processing ? (
              <span className="text-sm">
                Drop images, browse, or paste a screenshot
              </span>
            ) : (
              <span className="sr-only">Add more images</span>
            )}
          </button>
        ) : null}
      </div>

      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          PNG, JPG, WebP, or GIF. Large images are resized automatically.
        </p>
      )}
    </div>
  )
}
