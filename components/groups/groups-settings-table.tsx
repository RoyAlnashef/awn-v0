"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { GroupMembersDrawer } from "@/components/groups/group-members-drawer"
import { RoomsTable } from "@/components/groups/rooms-table"
import { adminListRooms, type AdminRoomRecord } from "@/lib/rooms/actions"

export function GroupsSettingsTable({
  initialRooms,
  loadError,
}: {
  initialRooms: AdminRoomRecord[]
  loadError: string | null
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [rooms, setRooms] = useState(initialRooms)
  const [membersRoom, setMembersRoom] = useState<AdminRoomRecord | null>(null)
  const [membersOpen, setMembersOpen] = useState(false)

  useEffect(() => {
    setRooms(initialRooms)
  }, [initialRooms])

  useEffect(() => {
    const roomId = searchParams.get("room")
    const openMembers = searchParams.get("members") === "1"
    if (!roomId || !openMembers) return

    const room = rooms.find((r) => r.id === roomId)
    if (room) {
      setMembersRoom(room)
      setMembersOpen(true)
    }
  }, [searchParams, rooms])

  function handleMembersUpdated() {
    void adminListRooms().then((result) => {
      if (result.ok) {
        setRooms(result.rooms)
        if (membersRoom) {
          const updated = result.rooms.find((room) => room.id === membersRoom.id)
          if (updated) setMembersRoom(updated)
        }
      }
    })
    router.refresh()
  }

  function handleMembersOpenChange(open: boolean) {
    setMembersOpen(open)
    if (!open) {
      const params = new URLSearchParams(searchParams.toString())
      params.delete("members")
      params.delete("room")
      const query = params.toString()
      router.replace(
        query ? `/groups/settings?${query}` : "/groups/settings",
        { scroll: false },
      )
      setMembersRoom(null)
    }
  }

  return (
    <>
      <RoomsTable
        initialRooms={rooms}
        loadError={loadError}
        showCreateButton={false}
        onOpenMembers={(room) => {
          setMembersRoom(room)
          setMembersOpen(true)
        }}
        onRoomsChange={setRooms}
      />

      <GroupMembersDrawer
        room={membersRoom}
        open={membersOpen}
        onOpenChange={handleMembersOpenChange}
        onUpdated={handleMembersUpdated}
      />
    </>
  )
}
