"use client"

import { useCallback, useRef, useState } from "react"
import Cropper from "react-easy-crop"
import type { Area } from "react-easy-crop"
import { Camera } from "lucide-react"
import { toast } from "sonner"
import "react-easy-crop/react-easy-crop.css"

import { initials } from "@/lib/people-data"
import {
  removeUserAvatar,
  uploadUserAvatar,
} from "@/lib/users/avatar-actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Slider } from "@/components/ui/slider"

async function createCroppedBlob(
  imageSrc: string,
  pixelCrop: Area,
): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = imageSrc
  })

  const size = Math.round(Math.min(pixelCrop.width, pixelCrop.height))
  const canvas = document.createElement("canvas")
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext("2d")!
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    size,
    size,
  )

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to create image blob"))
          return
        }
        resolve(blob)
      },
      "image/jpeg",
      0.95,
    )
  })
}

export function AvatarUploadEditor({
  userId,
  avatar,
  name,
  onChange,
  onPersisted,
  disabled = false,
}: {
  userId: string
  avatar?: string
  name: string
  onChange: (url: string | undefined) => void
  onPersisted: (avatar?: string) => void
  disabled?: boolean
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isApplying, setIsApplying] = useState(false)
  const [isRemoving, setIsRemoving] = useState(false)

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.addEventListener("load", () => {
      setImageSrc(reader.result as string)
      setCrop({ x: 0, y: 0 })
      setZoom(1)
    })
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels)
  }, [])

  const onZoomSliderChange = useCallback((value: number | readonly number[]) => {
    const next = typeof value === "number" ? value : value[0]
    if (typeof next === "number") setZoom(next)
  }, [])

  const handleApply = async () => {
    if (!imageSrc || !croppedAreaPixels) return
    setIsApplying(true)
    try {
      const blob = await createCroppedBlob(imageSrc, croppedAreaPixels)
      const formData = new FormData()
      formData.set("file", new File([blob], "avatar.jpg", { type: "image/jpeg" }))

      const result = await uploadUserAvatar(userId, formData)
      if (!result.ok) {
        toast.error(result.error)
        return
      }

      onChange(result.avatarUrl)
      onPersisted(result.avatarUrl)
      toast.success("Profile photo updated")
      setImageSrc(null)
    } finally {
      setIsApplying(false)
    }
  }

  const handleRemove = async () => {
    setIsRemoving(true)
    try {
      const result = await removeUserAvatar(userId)
      if (!result.ok) {
        toast.error(result.error)
        return
      }

      onChange(undefined)
      onPersisted(undefined)
      toast.success("Profile photo removed")
    } finally {
      setIsRemoving(false)
    }
  }

  const handleClose = () => {
    setImageSrc(null)
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={onFileChange}
        disabled={disabled || isApplying || isRemoving}
      />

      <div className="relative size-20 shrink-0">
        <Avatar className="size-20 ring-4 ring-background">
          <AvatarImage src={avatar ?? undefined} alt="" />
          <AvatarFallback className="text-lg">
            {initials(name || "?")}
          </AvatarFallback>
        </Avatar>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || isApplying || isRemoving}
          className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 outline-none transition-opacity hover:opacity-100 focus-visible:opacity-100 disabled:pointer-events-none"
          aria-label={avatar ? "Change profile photo" : "Upload profile photo"}
        >
          <Camera className="size-5 text-white" />
        </button>
      </div>

      <div className="flex flex-col items-start pt-1">
        {avatar ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={handleRemove}
            disabled={disabled || isApplying || isRemoving}
          >
            {isRemoving ? "Removing…" : "Remove"}
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isApplying || isRemoving}
          >
            <Camera className="size-3.5" />
            Upload photo
          </Button>
        )}
      </div>

      <Dialog
        open={!!imageSrc}
        onOpenChange={(open) => {
          if (!open) handleClose()
        }}
      >
        <DialogContent className="max-w-lg" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Crop profile photo</DialogTitle>
          </DialogHeader>

          <div className="relative h-72 w-full overflow-hidden rounded-2xl bg-black">
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            )}
          </div>

          <div className="flex items-center gap-4 px-1">
            <span className="w-10 shrink-0 text-xs text-muted-foreground">
              Zoom
            </span>
            <Slider
              value={[zoom]}
              min={1}
              max={3}
              step={0.05}
              onValueChange={onZoomSliderChange}
              aria-label="Zoom"
              className="flex-1"
            />
          </div>

          <DialogFooter showCloseButton={false}>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleApply}
              disabled={isApplying || !croppedAreaPixels}
            >
              {isApplying ? "Uploading…" : "Apply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
