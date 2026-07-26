"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { mutate as mutateSwr } from "swr"

import {
  joinRoom,
  leaveRoom,
  markRoomRead as markRoomReadAction,
} from "@/lib/rooms/actions"
import { resolveRoomEmoji } from "@/lib/rooms/emoji"
import { useRoomsList } from "@/lib/rooms/hooks/use-rooms-list"
import { RoomsRealtimeBridge } from "@/lib/rooms/hooks/use-rooms-realtime"
import { roomsListKey, roomsUnreadCountKey } from "@/lib/rooms/swr-keys"
import { isUuid } from "@/lib/messages/format"
import {
  GENERAL_ROOM_ID,
  sortRoomsForInbox,
  type Room,
} from "@/lib/messages-data"

export type RoomsCurrentUser = {
  id: string
  name: string
  avatarUrl?: string
}

type RoomsContextValue = {
  rooms: Room[]
  sortedRooms: Room[]
  unreadCount: number
  isLoading: boolean
  currentUser: RoomsCurrentUser
  activeRoomId: string | null
  setActiveRoomId: (id: string | null) => void
  toggleJoin: (id: string) => Promise<void>
  markRoomRead: (id: string) => void
  getRoom: (id: string) => Room | undefined
}

const RoomsContext = createContext<RoomsContextValue | null>(null)

export function RoomsProvider({
  children,
  currentUser,
}: {
  children: ReactNode
  currentUser: RoomsCurrentUser
}) {
  const { rooms: serverRooms, isLoading } = useRoomsList()
  const [joinOrder, setJoinOrder] = useState<string[]>([])
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null)

  // Convert RoomRecord[] (server) → Room[] (UI shape with emoji icon)
  const rooms = useMemo<Room[]>(() => {
    if (serverRooms.length > 0) {
      return serverRooms.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        icon: resolveRoomEmoji(r.icon),
        joined: r.joined,
        preview: r.preview,
        time: r.time,
        unread: r.unread,
        isDefault: r.isDefault,
      }))
    }
    return []
  }, [serverRooms])

  // Update joinOrder whenever server rooms change (keep joined rooms in order)
  useMemo(() => {
    if (rooms.length === 0) return
    const joinedIds = rooms
      .filter((r) => r.joined)
      .map((r) => r.id)
    setJoinOrder((prev) => {
      // Preserve previous order for already-tracked rooms; append new ones
      const prevSet = new Set(prev)
      const preserved = prev.filter((id) => joinedIds.includes(id))
      const newIds = joinedIds.filter((id) => !prevSet.has(id))
      return [...preserved, ...newIds]
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]) // Re-sync only when loading state changes (initial load)

  const sortedRooms = useMemo(
    () => sortRoomsForInbox(rooms, joinOrder),
    [rooms, joinOrder],
  )

  const unreadCount = useMemo(
    () => rooms.filter((r) => r.joined && r.unread).length,
    [rooms],
  )

  const toggleJoin = useCallback((id: string): Promise<void> => {
    const room = serverRooms.find((r) => r.id === id)
    if (!room) return Promise.resolve()

    const joining = !room.joined

    // Optimistically update join order
    setJoinOrder((order) => {
      if (joining) {
        const without = order.filter((roomId) => roomId !== id)
        // Find the GENERAL room ID from server rooms
        const generalId = serverRooms.find((r) => r.isDefault)?.id ?? GENERAL_ROOM_ID
        const general = without.filter((roomId) => roomId === generalId)
        const rest = without.filter((roomId) => roomId !== generalId)
        return [...general, id, ...rest]
      }
      return order.filter((roomId) => roomId !== id)
    })

    // Fire server action (UUIDs only)
    if (isUuid(id)) {
      const action = joining ? joinRoom(id) : leaveRoom(id)
      return action.then(() => {
        void mutateSwr(roomsListKey)
        void mutateSwr(roomsUnreadCountKey)
      })
    }

    return Promise.resolve()
  }, [serverRooms])

  const markRoomRead = useCallback((id: string) => {
    // Optimistic: SWR will revalidate to confirm
    if (isUuid(id)) {
      void markRoomReadAction(id).then(() => {
        void mutateSwr(roomsListKey)
        void mutateSwr(roomsUnreadCountKey)
      })
    }
  }, [])

  const getRoom = useCallback(
    (id: string) => rooms.find((r) => r.id === id),
    [rooms],
  )

  return (
    <RoomsContext.Provider
      value={{
        rooms,
        sortedRooms,
        unreadCount,
        isLoading,
        currentUser,
        activeRoomId,
        setActiveRoomId,
        toggleJoin,
        markRoomRead,
        getRoom,
      }}
    >
      <RoomsRealtimeBridge
        currentUserId={currentUser.id}
        activeRoomId={activeRoomId}
      />
      {children}
    </RoomsContext.Provider>
  )
}

export function useRooms() {
  const context = useContext(RoomsContext)
  if (!context) {
    throw new Error("useRooms must be used within a RoomsProvider")
  }
  return context
}
