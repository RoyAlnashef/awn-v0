"use client"

import { useEffect, useState, useTransition } from "react"

import { adminUpdateRoom } from "@/lib/rooms/actions"
import { DEFAULT_ROOM_EMOJI, resolveRoomEmoji } from "@/lib/rooms/emoji"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { EmojiPickerField } from "@/components/ui/emoji-picker-field"
import { Switch } from "@/components/ui/switch"
import type { AdminRoomRecord } from "@/lib/rooms/actions"

type Props = {
  room: AdminRoomRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated: (room: AdminRoomRecord) => void
}

export function EditRoomDialog({ room, open, onOpenChange, onUpdated }: Props) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [icon, setIcon] = useState(DEFAULT_ROOM_EMOJI)
  const [isDefault, setIsDefault] = useState(false)
  const [isPrivate, setIsPrivate] = useState(false)
  const [privateNote, setPrivateNote] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (room) {
      setName(room.name)
      setDescription(room.description)
      setIcon(resolveRoomEmoji(room.icon))
      setIsDefault(room.isDefault)
      setIsPrivate(room.isPrivate)
      setPrivateNote(room.privateNote)
      setError(null)
    }
  }, [room])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!room) return
    setError(null)

    startTransition(async () => {
      const result = await adminUpdateRoom(room.id, {
        name,
        description,
        icon,
        isDefault: isPrivate ? false : isDefault,
        isPrivate,
        privateNote,
      })

      if (!result.ok) {
        setError(result.error)
        return
      }

      onUpdated(result.room)
      onOpenChange(false)
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit group</DialogTitle>
            <DialogDescription>
              Update details for <strong>{room?.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-room-name">Name</Label>
              <Input
                id="edit-room-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-room-description">Description</Label>
              <Textarea
                id="edit-room-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this group for?"
                rows={2}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-room-icon">Emoji</Label>
              <EmojiPickerField
                id="edit-room-icon"
                value={icon}
                onChange={setIcon}
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <Label htmlFor="edit-room-private">Private group</Label>
                <p className="text-xs text-muted-foreground">
                  Members must request access and be approved by an admin.
                </p>
              </div>
              <Switch
                id="edit-room-private"
                checked={isPrivate}
                onCheckedChange={(checked) => {
                  setIsPrivate(checked)
                  if (checked) setIsDefault(false)
                }}
              />
            </div>

            {isPrivate ? (
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="edit-room-private-note">Note for prospective members</Label>
                <Textarea
                  id="edit-room-private-note"
                  value={privateNote}
                  onChange={(e) => setPrivateNote(e.target.value)}
                  placeholder="Explain who this group is for and any requirements."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Shown to members before they are approved.
                </p>
              </div>
            ) : null}

            <div className="flex items-center justify-between gap-3">
              <div className="flex flex-col gap-0.5">
                <Label htmlFor="edit-room-default">Auto-join for new members</Label>
                <p className="text-xs text-muted-foreground">
                  Members are automatically added when their account is approved.
                </p>
              </div>
              <Switch
                id="edit-room-default"
                checked={isDefault}
                disabled={isPrivate}
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
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !name.trim()}>
              {isPending ? "Saving…" : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
