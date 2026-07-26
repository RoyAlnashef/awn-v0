"use client"

import { useEffect, useState, useTransition } from "react"

import { adminUpdateRoom } from "@/lib/rooms/actions"
import { ROOM_ICON_OPTIONS } from "@/lib/rooms/icon-map"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  const [icon, setIcon] = useState("hash")
  const [isDefault, setIsDefault] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (room) {
      setName(room.name)
      setDescription(room.description)
      setIcon(room.icon)
      setIsDefault(room.isDefault)
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
        isDefault,
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
            <DialogTitle>Edit room</DialogTitle>
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
                placeholder="What is this room for?"
                rows={2}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="edit-room-icon">Icon</Label>
              <Select value={icon} onValueChange={(v) => { if (v) setIcon(v) }}>
                <SelectTrigger id="edit-room-icon">
                  <SelectValue placeholder="Choose an icon" />
                </SelectTrigger>
                <SelectContent>
                  {ROOM_ICON_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className="flex items-center gap-2">
                        <opt.icon className="size-4" />
                        {opt.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
