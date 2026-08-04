"use client"

import { useCallback, useRef, useState } from "react"
import Cropper from "react-easy-crop"
import type { Area } from "react-easy-crop"
import { Camera } from "lucide-react"
import "react-easy-crop/react-easy-crop.css"

import { initials } from "@/lib/people-data"
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

async function createCroppedObjectURL(
  imageSrc: string,
  pixelCrop: Area,
): Promise<string> {
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

  return new Promise<string>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to create image blob"))
          return
        }
        resolve(URL.createObjectURL(blob))
      },
      "image/jpeg",
      0.95,
    )
  })
}

export function AvatarUploadEditor({
  avatar,
  name,
  onChange,
}: {
  avatar?: string
  name: string
  onChange: (url: string | undefined) => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [isApplying, setIsApplying] = useState(false)

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
      const url = await createCroppedObjectURL(imageSrc, croppedAreaPixels)
      onChange(url)
      setImageSrc(null)
    } finally {
      setIsApplying(false)
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
      />

      {/* Circular avatar preview with camera overlay */}
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
          className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 outline-none transition-opacity hover:opacity-100 focus-visible:opacity-100"
          aria-label={avatar ? "Change profile photo" : "Upload profile photo"}
        >
          <Camera className="size-5 text-white" />
        </button>
      </div>

      {/* Single action slot: upload when empty, remove when set */}
      <div className="flex flex-col items-start pt-1">
        {avatar ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => onChange(undefined)}
          >
            Remove
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="size-3.5" />
            Upload photo
          </Button>
        )}
      </div>

      {/* Crop dialog */}
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

          {/* Cropper canvas */}
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

          {/* Zoom slider */}
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
              {isApplying ? "Applying…" : "Apply"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
