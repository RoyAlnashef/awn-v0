"use client"

import {
  cloneElement,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type MouseEvent,
  type ReactElement,
} from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

import {
  FLYOUT_DRAWER_CONTENT_CLASS,
  FlyoutDrawerClose,
} from "@/components/messages/flyout-drawer"
import { useRooms } from "@/components/rooms/rooms-provider"
import { roomThreadWithSharePath } from "@/lib/rooms/share-navigation"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"

type ShareContext = { kind: "job" | "member"; label: string }

function buildShareContext(
  shareJob: string | undefined,
  shareMember: string | undefined,
  shareLabel: string,
): ShareContext | undefined {
  if (shareJob) {
    return { kind: "job", label: shareLabel }
  }
  if (shareMember) {
    return { kind: "member", label: shareLabel }
  }
  return undefined
}

export function useShareToRooms({
  shareJob,
  shareMember,
  onClose,
}: {
  shareJob?: string
  shareMember?: string
  onClose?: () => void
}) {
  const router = useRouter()

  const handleSelectRoom = useCallback(
    (roomId: string) => {
      onClose?.()
      router.push(
        roomThreadWithSharePath({
          roomId,
          shareJob,
          shareMember,
        }),
      )
    },
    [onClose, router, shareJob, shareMember],
  )

  return { handleSelectRoom }
}

export function ShareToRoomsPanel({
  open,
  onSelectRoom,
  shareContext,
}: {
  open: boolean
  onSelectRoom: (roomId: string) => void
  shareContext?: ShareContext
}) {
  const [query, setQuery] = useState("")
  const { sortedRooms } = useRooms()

  useEffect(() => {
    if (!open) {
      setQuery("")
    }
  }, [open])

  const q = query.trim().toLowerCase()

  const joinedRooms = useMemo(
    () => sortedRooms.filter((room) => room.joined),
    [sortedRooms],
  )

  const filteredRooms = useMemo(() => {
    if (!q) return joinedRooms
    return joinedRooms.filter(
      (room) =>
        room.name.toLowerCase().includes(q) ||
        room.description.toLowerCase().includes(q),
    )
  }, [joinedRooms, q])

  function handleSelect(roomId: string) {
    onSelectRoom(roomId)
    setQuery("")
  }

  const emptyMessage = shareContext?.kind === "member"
    ? "Join a group to share this member."
    : "Join a group to share this job."

  return (
    <>
      <DrawerHeader className="shrink-0 gap-3 border-b p-4 pr-14">
        <div className="flex flex-col gap-1">
          <DrawerTitle>Share with…</DrawerTitle>
          <DrawerDescription>
            {shareContext
              ? `Choose which group to send ${shareContext.label} to.`
              : "Choose a group to share to."}
          </DrawerDescription>
        </div>
        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search groups…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="pl-9"
            autoFocus
          />
        </div>
      </DrawerHeader>

      <ScrollArea className="min-h-0 flex-1">
        {filteredRooms.length > 0 ? (
          <ul className="flex flex-col">
            {filteredRooms.map((room) => (
              <li key={room.id}>
                <button
                  type="button"
                  onClick={() => handleSelect(room.id)}
                  className="flex w-full items-center gap-3 border-b px-4 py-3 text-left transition-colors last:border-b-0 hover:bg-accent/60"
                >
                  <span
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-base"
                    aria-hidden
                  >
                    {room.icon}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <p className="truncate text-sm font-medium text-foreground">
                      {room.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {room.description}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            {q ? "No groups match your search." : emptyMessage}
          </p>
        )}
      </ScrollArea>
    </>
  )
}

export function ShareToRoomsDrawer({
  open,
  onOpenChange,
  shareJob,
  shareMember,
  shareLabel,
  onSelectComplete,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  shareJob?: string
  shareMember?: string
  shareLabel: string
  onSelectComplete?: () => void
}) {
  const shareContext = buildShareContext(shareJob, shareMember, shareLabel)

  const { handleSelectRoom } = useShareToRooms({
    shareJob,
    shareMember,
    onClose: () => {
      onOpenChange(false)
      onSelectComplete?.()
    },
  })

  return (
    <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
      {open ? (
        <DrawerContent className={FLYOUT_DRAWER_CONTENT_CLASS}>
          <FlyoutDrawerClose />
          <ShareToRoomsPanel
            open={open}
            onSelectRoom={handleSelectRoom}
            shareContext={shareContext}
          />
        </DrawerContent>
      ) : null}
    </Drawer>
  )
}

type ClickableChild = ReactElement<{
  onClick?: (event: MouseEvent<HTMLElement>) => void
}>

export function ShareToRoomsFlyout({
  shareJob,
  shareMember,
  shareLabel,
  children,
}: {
  shareJob?: string
  shareMember?: string
  shareLabel: string
  children: ClickableChild
}) {
  const [open, setOpen] = useState(false)

  function handleOpen(event: MouseEvent<HTMLElement>) {
    children.props.onClick?.(event)
    if (!event.defaultPrevented) {
      setOpen(true)
    }
  }

  return (
    <>
      {cloneElement(children, { onClick: handleOpen })}
      <ShareToRoomsDrawer
        open={open}
        onOpenChange={setOpen}
        shareJob={shareJob}
        shareMember={shareMember}
        shareLabel={shareLabel}
      />
    </>
  )
}
