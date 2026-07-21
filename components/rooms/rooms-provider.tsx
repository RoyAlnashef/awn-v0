"use client"

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import {
  GENERAL_ROOM_ID,
  joinedRoomUnreadCount,
  rooms as initialRooms,
  sortRoomsForInbox,
  type Room,
} from "@/lib/messages-data"

type RoomsContextValue = {
  rooms: Room[]
  sortedRooms: Room[]
  unreadCount: number
  toggleJoin: (id: string) => void
  markRoomRead: (id: string) => void
  getRoom: (id: string) => Room | undefined
}

const RoomsContext = createContext<RoomsContextValue | null>(null)

export function RoomsProvider({ children }: { children: ReactNode }) {
  const [rooms, setRooms] = useState<Room[]>(initialRooms)
  const [joinOrder, setJoinOrder] = useState<string[]>(() =>
    initialRooms.filter((r) => r.joined).map((r) => r.id),
  )

  const sortedRooms = useMemo(
    () => sortRoomsForInbox(rooms, joinOrder),
    [rooms, joinOrder],
  )

  const unreadCount = joinedRoomUnreadCount(rooms)

  const toggleJoin = useCallback((id: string) => {
    let joining: boolean | null = null

    setRooms((prev) => {
      const room = prev.find((r) => r.id === id)
      if (!room) return prev

      joining = !room.joined
      return prev.map((r) =>
        r.id === id
          ? joining
            ? { ...r, joined: true, unread: false }
            : { ...r, joined: false }
          : r,
      )
    })

    if (joining === null) return

    setJoinOrder((order) => {
      if (joining) {
        const without = order.filter((roomId) => roomId !== id)
        const general = without.filter((roomId) => roomId === GENERAL_ROOM_ID)
        const rest = without.filter((roomId) => roomId !== GENERAL_ROOM_ID)
        return [...general, id, ...rest]
      }
      return order.filter((roomId) => roomId !== id)
    })
  }, [])

  const markRoomRead = useCallback((id: string) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.id === id && r.joined && r.unread ? { ...r, unread: false } : r,
      ),
    )
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
        toggleJoin,
        markRoomRead,
        getRoom,
      }}
    >
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
