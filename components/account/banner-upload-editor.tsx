"use client"

import { useCallback, useRef, useState } from "react"
import { ImageIcon, MoveVertical, Upload } from "lucide-react"
import { toast } from "sonner"

import {
  removeMemberBanner,
  updateBannerPosition,
  uploadMemberBanner,
} from "@/lib/account/profile-actions"
import { clampBannerPositionY } from "@/lib/account/profile-data"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export function BannerUploadEditor({
  userId,
  banner,
  bannerPositionY = 50,
  onChange,
  onPersisted,
  disabled = false,
  children,
}: {
  userId: string
  banner?: string
  bannerPositionY?: number
  onChange: (url: string | undefined, positionY: number) => void
  onPersisted: (banner?: string, positionY?: number) => void
  disabled?: boolean
  children?: React.ReactNode
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  const dragState = useRef<{
    startY: number
    startPosition: number
    lastPosition: number
  } | null>(null)

  const uploadFile = async (file: File) => {
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.set("file", file)

      const result = await uploadMemberBanner(userId, formData)
      if (!result.ok) {
        toast.error(result.error)
        return
      }

      const nextUrl = result.bannerUrl
      onChange(nextUrl, 50)
      onPersisted(nextUrl, 50)
      toast.success("Banner updated")
    } finally {
      setIsUploading(false)
    }
  }

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ""
    if (!file) return
    await uploadFile(file)
  }

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!banner || disabled || isUploading || isRemoving) return
      e.currentTarget.setPointerCapture(e.pointerId)
      dragState.current = {
        startY: e.clientY,
        startPosition: bannerPositionY,
        lastPosition: bannerPositionY,
      }
      setIsDragging(true)
    },
    [banner, bannerPositionY, disabled, isUploading, isRemoving],
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging || !dragState.current || !banner) return
      const delta = e.clientY - dragState.current.startY
      const newPosition = Math.max(
        0,
        Math.min(100, dragState.current.startPosition + delta * 0.3),
      )
      dragState.current.lastPosition = newPosition
      onChange(banner, newPosition)
    },
    [isDragging, banner, onChange],
  )

  const onPointerUp = useCallback(async () => {
    const drag = dragState.current
    setIsDragging(false)
    dragState.current = null

    if (!banner || !drag) return
    const nextPosition = clampBannerPositionY(drag.lastPosition)
    if (nextPosition === clampBannerPositionY(drag.startPosition)) return

    const result = await updateBannerPosition(userId, nextPosition)
    if (!result.ok) {
      toast.error(result.error)
      onChange(banner, drag.startPosition)
      return
    }

    onPersisted(banner, nextPosition)
  }, [banner, onChange, onPersisted, userId])

  const handleRemove = async () => {
    setIsRemoving(true)
    try {
      const result = await removeMemberBanner(userId)
      if (!result.ok) {
        toast.error(result.error)
        return
      }

      onChange(undefined, 50)
      onPersisted(undefined, 50)
      toast.success("Banner removed")
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <div className="flex flex-col">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={onFileChange}
        disabled={disabled || isUploading || isRemoving}
      />

      <div
        className={cn(
          "group relative aspect-32/9 w-full select-none overflow-hidden rounded-xl bg-muted",
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
                disabled={disabled || isUploading || isRemoving}
              >
                <Upload className="size-3.5" />
                {isUploading ? "Uploading…" : "Replace"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="xs"
                className="bg-background/80 text-muted-foreground shadow-sm backdrop-blur-sm hover:bg-background/90 hover:text-foreground"
                onClick={handleRemove}
                disabled={disabled || isUploading || isRemoving}
              >
                {isRemoving ? "Removing…" : "Remove"}
              </Button>
            </div>
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
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading || isRemoving}
            className="flex h-full w-full items-center justify-center gap-2 text-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:text-foreground disabled:opacity-60"
          >
            <ImageIcon className="size-4" />
            {isUploading ? "Uploading…" : "Upload a banner image"}
          </button>
        )}
      </div>

      <div className="relative z-10 -mt-10 flex items-end px-4 pb-1">
        <div className="flex min-w-0 items-end gap-4">{children}</div>
      </div>
    </div>
  )
}
