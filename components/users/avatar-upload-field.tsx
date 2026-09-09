"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { initials } from "@/lib/users-data"
import {
  removeUserAvatar,
  uploadUserAvatar,
} from "@/lib/users/avatar-actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

const ACCEPT = "image/jpeg,image/png,image/webp"

export function AvatarUploadField({
  userId,
  name,
  avatarUrl: initialAvatarUrl,
  disabled = false,
}: {
  userId: string
  name: string
  avatarUrl?: string
  disabled?: boolean
}) {
  const router = useRouter()
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [avatarUrl, setAvatarUrl] = React.useState(initialAvatarUrl)
  const [pending, setPending] = React.useState(false)

  React.useEffect(() => {
    setAvatarUrl(initialAvatarUrl)
  }, [initialAvatarUrl])

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ""
    if (!file) return

    setPending(true)
    try {
      const formData = new FormData()
      formData.set("file", file)

      const result = await uploadUserAvatar(userId, formData)
      if (!result.ok) {
        toast.error(result.error)
        return
      }

      setAvatarUrl(result.avatarUrl)
      toast.success("Profile photo updated")
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  async function handleRemove() {
    setPending(true)
    try {
      const result = await removeUserAvatar(userId)
      if (!result.ok) {
        toast.error(result.error)
        return
      }

      setAvatarUrl(undefined)
      toast.success("Profile photo removed")
      router.refresh()
    } finally {
      setPending(false)
    }
  }

  const isDisabled = disabled || pending

  return (
    <div className="grid gap-2">
      <Label className="gap-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        Profile photo
      </Label>
      <div className="flex flex-wrap items-center gap-4">
        <Avatar className="size-16" data-size="lg">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
          <AvatarFallback className="text-base">
            {initials(name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isDisabled}
            onClick={() => inputRef.current?.click()}
          >
            {pending ? "Saving…" : avatarUrl ? "Change photo" : "Upload photo"}
          </Button>
          {avatarUrl ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isDisabled}
              onClick={handleRemove}
            >
              Remove photo
            </Button>
          ) : null}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          className="sr-only"
          disabled={isDisabled}
          onChange={handleFileChange}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        JPEG, PNG, or WebP. Max 2 MB.
      </p>
    </div>
  )
}
