"use client"

import { useEffect, useState, useTransition } from "react"
import { Archive, ArchiveRestore, Pencil, Users } from "lucide-react"

import { adminArchiveRoom } from "@/lib/rooms/actions"
import { resolveRoomEmoji } from "@/lib/rooms/emoji"
import { formatRelativeTime } from "@/lib/messages/format"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { EditRoomDialog } from "@/components/groups/edit-room-dialog"
import { CreateRoomDialog } from "@/components/groups/create-room-dialog"
import type { AdminRoomRecord } from "@/lib/rooms/actions"

export function RoomsTable({
  initialRooms,
  loadError,
  showCreateButton = true,
}: {
  initialRooms: AdminRoomRecord[]
  loadError: string | null
  showCreateButton?: boolean
}) {
  const [rooms, setRooms] = useState<AdminRoomRecord[]>(initialRooms)
  const [editRoom, setEditRoom] = useState<AdminRoomRecord | null>(null)
  const [editOpen, setEditOpen] = useState(false)
  const [archivingId, setArchivingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    setRooms(initialRooms)
  }, [initialRooms])

  function handleCreated(room: AdminRoomRecord) {
    setRooms((prev) => [...prev, room].sort((a, b) => a.sortOrder - b.sortOrder))
  }

  function handleUpdated(room: AdminRoomRecord) {
    setRooms((prev) => prev.map((r) => (r.id === room.id ? room : r)))
  }

  function handleArchive(room: AdminRoomRecord, archived: boolean) {
    setArchivingId(room.id)
    startTransition(async () => {
      const result = await adminArchiveRoom(room.id, archived)
      if (result.ok) {
        setRooms((prev) =>
          prev.map((r) =>
            r.id === room.id ? { ...r, isArchived: archived } : r,
          ),
        )
      }
      setArchivingId(null)
    })
  }

  function openEdit(room: AdminRoomRecord) {
    setEditRoom(room)
    setEditOpen(true)
  }

  if (loadError) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 rounded-xl border border-dashed p-8 text-center">
        <p className="text-sm font-medium text-destructive">Failed to load groups</p>
        <p className="text-sm text-muted-foreground">{loadError}</p>
      </div>
    )
  }

  const activeRooms = rooms.filter((r) => !r.isArchived)
  const archivedRooms = rooms.filter((r) => r.isArchived)

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-6">
        {showCreateButton ? (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {activeRooms.length} active group{activeRooms.length !== 1 ? "s" : ""}
              {archivedRooms.length > 0
                ? `, ${archivedRooms.length} archived`
                : ""}
            </p>
            <CreateRoomDialog onCreated={handleCreated} />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            {activeRooms.length} active group{activeRooms.length !== 1 ? "s" : ""}
            {archivedRooms.length > 0
              ? `, ${archivedRooms.length} archived`
              : ""}
          </p>
        )}

        <div className="rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group</TableHead>
                <TableHead className="hidden sm:table-cell">Members</TableHead>
                <TableHead className="hidden md:table-cell">Created</TableHead>
                <TableHead className="hidden lg:table-cell">Status</TableHead>
                <TableHead className="w-24 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    No groups yet. Create the first one with New group.
                  </TableCell>
                </TableRow>
              ) : (
                rooms.map((room) => {
                  const emoji = resolveRoomEmoji(room.icon)
                  return (
                    <TableRow
                      key={room.id}
                      className={room.isArchived ? "opacity-50" : undefined}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-xl leading-none">
                            {emoji}
                          </span>
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">
                                {room.name}
                              </span>
                              {room.isDefault ? (
                                <Badge variant="secondary" className="text-xs px-1.5 py-0">
                                  auto-join
                                </Badge>
                              ) : null}
                            </div>
                            <span className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
                              {room.description || room.slug}
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Users className="size-3.5" />
                          {room.memberCount.toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                        {formatRelativeTime(room.createdAt)}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {room.isArchived ? (
                          <Badge variant="outline" className="text-xs">
                            Archived
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            Active
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {!room.isArchived ? (
                            <Tooltip>
                              <TooltipTrigger
                                render={
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8"
                                    aria-label={`Edit ${room.name}`}
                                    onClick={() => openEdit(room)}
                                  >
                                    <Pencil className="size-3.5" />
                                  </Button>
                                }
                              />
                              <TooltipContent>Edit</TooltipContent>
                            </Tooltip>
                          ) : null}

                          <Tooltip>
                            <TooltipTrigger
                              render={
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="size-8"
                                  aria-label={
                                    room.isArchived
                                      ? `Unarchive ${room.name}`
                                      : `Archive ${room.name}`
                                  }
                                  disabled={
                                    isPending && archivingId === room.id
                                  }
                                  onClick={() =>
                                    handleArchive(room, !room.isArchived)
                                  }
                                >
                                  {room.isArchived ? (
                                    <ArchiveRestore className="size-3.5" />
                                  ) : (
                                    <Archive className="size-3.5" />
                                  )}
                                </Button>
                              }
                            />
                            <TooltipContent>
                              {room.isArchived ? "Unarchive" : "Archive"}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <EditRoomDialog
        room={editRoom}
        open={editOpen}
        onOpenChange={setEditOpen}
        onUpdated={handleUpdated}
      />
    </TooltipProvider>
  )
}
