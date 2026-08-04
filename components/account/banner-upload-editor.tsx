"use client"

import { useCallback, useRef, useState } from "react"
import { ImageIcon, MoveVertical, Upload } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function BannerUploadEditor({
  banner,
  bannerPositionY = 50,
  onChange,
  children,
}: {
  banner?: string
  bannerPositionY?: number
  onChange: (url: string | undefined, positionY: number) => void
  children?: React.ReactNode
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Stored in a ref so pointer move doesn't cause re-renders
  const dragState = useRef<{
    startY: number
    startPosition: number
  } | null>(null)

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    onChange(url, 50)
    e.target.value = ""
  }

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!banner) return
      e.currentTarget.setPointerCapture(e.pointerId)
      dragState.current = {
        startY: e.clientY,
        startPosition: bannerPositionY,
      }
      setIsDragging(true)
    },
    [banner, bannerPositionY],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging || !dragState.current || !banner) return
      const delta = e.clientY - dragState.current.startY
      // ~0.3% per pixel of drag feels natural for a typical banner image
      const newPosition = Math.max(
        0,
        Math.min(100, dragState.current.startPosition + delta * 0.3),
      )
      onChange(banner, newPosition)
    },
    [isDragging, banner, onChange],
  )

  const onPointerUp = useCallback(() => {
    setIsDragging(false)
    dragState.current = null
  }, [])

  return (
    <div className="flex flex-col">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={onFileChange}
      />

      {/* Banner strip — matches the h-24 hero in PersonProfileCard */}
      <div
        className={cn(
          "group relative h-24 w-full select-none overflow-hidden rounded-xl bg-muted",
          banner && !isDragging && "cursor-ns-resize",
          isDragging && "cursor-grabbing",
        )}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {banner ? (
          <>
            <img
              src={banner}
              alt=""
              draggable={false}
              className="pointer-events-none h-full w-full object-cover"
              style={{ objectPosition: `center ${bannerPositionY}%` }}
            />
            {/* Floating controls — top-right, out of the avatar row */}
            <div
              className="absolute top-2 right-2 z-10 flex items-center gap-1.5"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <Button
                type="button"
                variant="ghost"
                size="xs"
                className="bg-background/80 text-muted-foreground shadow-sm backdrop-blur-sm hover:bg-background/90 hover:text-foreground"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="size-3.5" />
                Replace
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                className="bg-background/80 text-muted-foreground shadow-sm backdrop-blur-sm hover:bg-background/90 hover:text-foreground"
                onClick={() => onChange(undefined, 50)}
              >
                Remove
              </Button>
            </div>
            {/* Reposition hint overlay */}
            <div
              className={cn(
                "pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-opacity",
                !isDragging && "group-hover:opacity-100",
              )}
            >
              <div className="flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm">
                <MoveVertical className="size-3.5" />
                Drag to reposition
              </div>
            </div>
          </>
        ) : (
          /* Empty state — click to upload */
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-full w-full items-center justify-center gap-2 text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:text-foreground"
          >
            <ImageIcon className="size-4" />
            Upload a banner image
          </button>
        )}
      </div>

      {/* Avatar overlaps banner bottom-left */}
      <div className="-mt-10 flex items-end px-4 pb-1">
        <div className="flex min-w-0 items-end gap-4">{children}</div>
      </div>
    </div>
  )
}
