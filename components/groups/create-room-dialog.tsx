"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"

import { adminCreateRoom } from "@/lib/rooms/actions"
import { DEFAULT_ROOM_EMOJI } from "@/lib/rooms/emoji"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { EmojiPickerField } from "@/components/ui/emoji-picker-field"
import { Switch } from "@/components/ui/switch"
import type { AdminRoomRecord } from "@/lib/rooms/actions"

type Props = {
  onCreated?: (room: AdminRoomRecord) => void
  disabled?: boolean
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

export function CreateRoomDialog({ onCreated, disabled }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [slug, setSlug] = useState("")
  const [slugManual, setSlugManual] = useState(false)
  const [description, setDescription] = useState("")
  const [icon, setIcon] = useState(DEFAULT_ROOM_EMOJI)
  const [isDefault, setIsDefault] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleNameChange(value: string) {
    setName(value)
    if (!slugManual) {
      setSlug(toSlug(value))
    }
  }

  function handleSlugChange(value: string) {
    setSlug(value)
    setSlugManual(true)
  }

  function handleOpenChange(next: boolean) {
    if (!next) {
      setName("")
      setSlug("")
      setSlugManual(false)
      setDescription("")
      setIcon(DEFAULT_ROOM_EMOJI)
      setIsDefault(false)
      setError(null)
    }
    setOpen(next)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    startTransition(async () => {
      const result = await adminCreateRoom({
        name,
        slug,
        description,
        icon,
        isDefault,
      })

      if (!result.ok) {
        setError(result.error)
        return
      }

      onCreated?.(result.room)
      router.refresh()
      setOpen(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button size="sm" disabled={disabled}>
            <Plus className="size-4" />
            New room
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create room</DialogTitle>
            <DialogDescription>
              Add a new community room for touring crew to join.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="room-name">Name</Label>
              <Input
                id="room-name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Stage Management"
                required
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="room-slug">Slug</Label>
              <Input
                id="room-slug"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="e.g. stage-management"
                pattern="[a-z0-9-]+"
                title="Lowercase letters, numbers, and hyphens only"
                required
              />
              <p className="text-xs text-muted-foreground">
                Lowercase letters, numbers, and hyphens only.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="room-description">Description</Label>
              <Textarea
                id="room-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this room for?"
                rows={2}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="room-icon">Emoji</Label>
              <EmojiPickerField
                id="room-icon"
                value={icon}
                onChange={setIcon}
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <Label htmlFor="room-default">Auto-join for new members</Label>
                <p className="text-xs text-muted-foreground">
                  Members are automatically added when their account is approved.
                </p>
              </div>
              <Switch
                id="room-default"
                checked={isDefault}
                onCheckedChange={setIsDefault}
              />
            </div>

            {error ? (
              <p className="text-sm text-destructive">{error}</p>
            ) : null}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !name.trim() || !slug.trim()}>
              {isPending ? "Creating…" : "Create room"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
