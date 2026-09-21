"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import { toast } from "sonner"

import {
  adminApproveJoinRequest,
  adminBlockMember,
  adminDenyJoinRequest,
  adminListRoomMembers,
  adminRemoveMember,
  adminUnblockMember,
  type AdminRoomRecord,
  type RoomAdminBlockedMember,
  type RoomAdminMember,
  type RoomAdminPendingMember,
} from "@/lib/rooms/actions"
import { resolveRoomEmoji } from "@/lib/rooms/emoji"
import { formatRelativeTime } from "@/lib/messages/format"
import type { Person } from "@/lib/people-data"
import { initials } from "@/lib/users-data"
import { cn } from "@/lib/utils"
import { PersonProfileDrawer } from "@/components/people/person-profile-drawer"
import {
  FLYOUT_DRAWER_CONTENT_CLASS,
  FlyoutDrawerClose,
} from "@/components/messages/flyout-drawer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type DrawerMember =
  | RoomAdminMember
  | RoomAdminPendingMember
  | RoomAdminBlockedMember

type GroupMemberTab = "members" | "invites" | "blocked"

const TAB_ORDER: GroupMemberTab[] = ["members", "invites", "blocked"]

function visibleTabsForLists(
  members: RoomAdminMember[],
  pending: RoomAdminPendingMember[],
  blocked: RoomAdminBlockedMember[],
): GroupMemberTab[] {
  return TAB_ORDER.filter((tab) => {
    if (tab === "members") return members.length > 0
    if (tab === "invites") return pending.length > 0
    return blocked.length > 0
  })
}

function memberToPerson(member: DrawerMember): Person {
  return {
    id: member.id,
    name: member.name,
    role: "AWN Member",
    department: "",
    homeBase: "",
    city: "",
    availability: "Between Tours",
    availableFrom: "",
    availableTo: "",
    venueTiers: [],
    workAuth: [],
    yearsExperience: 0,
    credits: 0,
    vouches: 0,
    topTours: [],
    skills: [],
    avatar: member.avatarUrl,
    followed: false,
  }
}

function MemberRow({
  member,
  meta,
  actions,
  onOpenProfile,
}: {
  member: DrawerMember
  meta: string
  actions?: React.ReactNode
  onOpenProfile: (member: DrawerMember) => void
}) {
  return (
    <div className="flex items-center gap-3 border-b px-4 py-3 last:border-b-0">
      <button
        type="button"
        onClick={() => onOpenProfile(member)}
        className="flex min-w-0 flex-1 items-center gap-3 text-left transition-opacity hover:opacity-90"
      >
        <Avatar className="size-10 shrink-0">
          {member.avatarUrl ? (
            <AvatarImage src={member.avatarUrl} alt={member.name} />
          ) : null}
          <AvatarFallback>{initials(member.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{member.name}</p>
          <p className="text-xs text-muted-foreground">{meta}</p>
        </div>
      </button>
      {actions ? <div className="flex shrink-0 items-center gap-1">{actions}</div> : null}
    </div>
  )
}

export function GroupMembersDrawer({
  room,
  open,
  onOpenChange,
  onUpdated,
}: {
  room: AdminRoomRecord | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdated?: () => void
}) {
  const [members, setMembers] = useState<RoomAdminMember[]>([])
  const [pending, setPending] = useState<RoomAdminPendingMember[]>([])
  const [blocked, setBlocked] = useState<RoomAdminBlockedMember[]>([])
  const [loading, setLoading] = useState(false)
  const [actionId, setActionId] = useState<string | null>(null)
  const [removeTarget, setRemoveTarget] = useState<RoomAdminMember | null>(null)
  const [blockTarget, setBlockTarget] = useState<RoomAdminMember | null>(null)
  const [profilePerson, setProfilePerson] = useState<Person | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<GroupMemberTab>("members")
  const [isPending, startTransition] = useTransition()

  const visibleTabs = useMemo(
    () => visibleTabsForLists(members, pending, blocked),
    [members, pending, blocked],
  )

  useEffect(() => {
    if (!open) {
      setActiveTab("members")
    }
  }, [open])

  useEffect(() => {
    if (loading || visibleTabs.length === 0) return
    if (!visibleTabs.includes(activeTab)) {
      setActiveTab(visibleTabs[0])
    }
  }, [activeTab, loading, visibleTabs])

  useEffect(() => {
    if (!open || !room) {
      setMembers([])
      setPending([])
      setBlocked([])
      return
    }

    setLoading(true)
    void adminListRoomMembers(room.id).then((result) => {
      if (result.ok) {
        setMembers(result.members)
        setPending(result.pending)
        setBlocked(result.blocked)
      } else {
        toast.error(result.error)
      }
      setLoading(false)
    })
  }, [open, room])

  function refreshMembers() {
    if (!room) return
    void adminListRoomMembers(room.id).then((result) => {
      if (result.ok) {
        setMembers(result.members)
        setPending(result.pending)
        setBlocked(result.blocked)
        onUpdated?.()
      }
    })
  }

  function openProfile(member: DrawerMember) {
    const isFirstMount = profilePerson === null
    setProfilePerson(memberToPerson(member))
    if (isFirstMount) {
      requestAnimationFrame(() => setProfileOpen(true))
    } else {
      setProfileOpen(true)
    }
  }

  function handleApprove(profileId: string) {
    if (!room) return
    setActionId(profileId)
    startTransition(async () => {
      const result = await adminApproveJoinRequest(room.id, profileId)
      if (result.ok) {
        refreshMembers()
      } else {
        toast.error(result.error)
      }
      setActionId(null)
    })
  }

  function handleDeny(profileId: string) {
    if (!room) return
    setActionId(profileId)
    startTransition(async () => {
      const result = await adminDenyJoinRequest(room.id, profileId)
      if (result.ok) {
        refreshMembers()
      } else {
        toast.error(result.error)
      }
      setActionId(null)
    })
  }

  function handleRemove() {
    if (!room || !removeTarget) return
    const profileId = removeTarget.id
    setActionId(profileId)
    startTransition(async () => {
      const result = await adminRemoveMember(room.id, profileId)
      if (result.ok) {
        setRemoveTarget(null)
        refreshMembers()
      } else {
        toast.error(result.error)
      }
      setActionId(null)
    })
  }

  function handleBlock() {
    if (!room || !blockTarget) return
    const profileId = blockTarget.id
    setActionId(profileId)
    startTransition(async () => {
      const result = await adminBlockMember(room.id, profileId)
      if (result.ok) {
        setBlockTarget(null)
        refreshMembers()
      } else {
        toast.error(result.error)
      }
      setActionId(null)
    })
  }

  function handleUnblock(profileId: string) {
    if (!room) return
    setActionId(profileId)
    startTransition(async () => {
      const result = await adminUnblockMember(room.id, profileId)
      if (result.ok) {
        refreshMembers()
      } else {
        toast.error(result.error)
      }
      setActionId(null)
    })
  }

  if (!room) return null

  const subtitleParts = [
    `${members.length} member${members.length !== 1 ? "s" : ""}`,
    blocked.length > 0
      ? `${blocked.length} blocked`
      : null,
    pending.length > 0
      ? `${pending.length} pending`
      : null,
  ].filter(Boolean)

  const emoji = resolveRoomEmoji(room.icon)

  return (
    <>
      <Drawer open={open} onOpenChange={onOpenChange} swipeDirection="right">
        <DrawerContent className={FLYOUT_DRAWER_CONTENT_CLASS}>
          <FlyoutDrawerClose />
          <DrawerTitle className="sr-only">Group members for {room.name}</DrawerTitle>
          <DrawerDescription className="sr-only">
            Current members and pending join requests.
          </DrawerDescription>

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="border-b px-4 py-4">
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-xl leading-none">
                  {emoji}
                </span>
                <div className="min-w-0">
                  <h2 className="truncate font-heading text-lg font-semibold">
                    {room.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {subtitleParts.join(" · ")}
                  </p>
                </div>
              </div>
            </div>

            {loading ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                Loading members…
              </p>
            ) : visibleTabs.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">
                No members yet.
              </p>
            ) : (
              <Tabs
                value={activeTab}
                onValueChange={(value) => setActiveTab(value as GroupMemberTab)}
                className="flex min-h-0 flex-1 flex-col gap-0"
              >
                <div className="shrink-0 px-3 py-3">
                  <TabsList className="flex h-9 w-full items-center rounded-md border border-border bg-transparent px-0.75 py-1">
                    {visibleTabs.includes("members") ? (
                      <TabsTrigger
                        value="members"
                        className="h-7 flex-1 rounded-sm text-xs sm:text-sm"
                      >
                        Members
                        {members.length > 0 ? (
                          <span className="text-muted-foreground">
                            {members.length}
                          </span>
                        ) : null}
                      </TabsTrigger>
                    ) : null}
                    {visibleTabs.includes("invites") ? (
                      <TabsTrigger
                        value="invites"
                        className="h-7 flex-1 rounded-sm text-xs sm:text-sm"
                      >
                        Invites
                        {pending.length > 0 ? (
                          <span className="text-muted-foreground">
                            {pending.length}
                          </span>
                        ) : null}
                      </TabsTrigger>
                    ) : null}
                    {visibleTabs.includes("blocked") ? (
                      <TabsTrigger
                        value="blocked"
                        className="h-7 flex-1 rounded-sm text-xs sm:text-sm"
                      >
                        Blocked
                        {blocked.length > 0 ? (
                          <span className="text-muted-foreground">
                            {blocked.length}
                          </span>
                        ) : null}
                      </TabsTrigger>
                    ) : null}
                  </TabsList>
                </div>

                {visibleTabs.includes("members") ? (
                  <TabsContent
                    value="members"
                    className="mt-0 min-h-0 flex-1 overflow-y-auto"
                  >
                    {members.map((member) => (
                      <MemberRow
                        key={member.id}
                        member={member}
                        meta={`Joined ${formatRelativeTime(member.joinedAt)}`}
                        onOpenProfile={openProfile}
                        actions={
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isPending && actionId === member.id}
                              onClick={() => setRemoveTarget(member)}
                            >
                              Remove
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:text-destructive"
                              disabled={isPending && actionId === member.id}
                              onClick={() => setBlockTarget(member)}
                            >
                              Block
                            </Button>
                          </>
                        }
                      />
                    ))}
                  </TabsContent>
                ) : null}

                {visibleTabs.includes("invites") ? (
                  <TabsContent
                    value="invites"
                    className="mt-0 min-h-0 flex-1 overflow-y-auto"
                  >
                    {pending.map((member) => (
                      <MemberRow
                        key={member.id}
                        member={member}
                        meta={`Requested ${formatRelativeTime(member.requestedAt)}`}
                        onOpenProfile={openProfile}
                        actions={
                          <>
                            <Button
                              size="sm"
                              disabled={isPending && actionId === member.id}
                              onClick={() => handleApprove(member.id)}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isPending && actionId === member.id}
                              onClick={() => handleDeny(member.id)}
                            >
                              Deny
                            </Button>
                          </>
                        }
                      />
                    ))}
                  </TabsContent>
                ) : null}

                {visibleTabs.includes("blocked") ? (
                  <TabsContent
                    value="blocked"
                    className="mt-0 min-h-0 flex-1 overflow-y-auto"
                  >
                    {blocked.map((member) => (
                      <MemberRow
                        key={member.id}
                        member={member}
                        meta={`Blocked ${formatRelativeTime(member.blockedAt)}`}
                        onOpenProfile={openProfile}
                        actions={
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={isPending && actionId === member.id}
                            onClick={() => handleUnblock(member.id)}
                          >
                            Unblock
                          </Button>
                        }
                      />
                    ))}
                  </TabsContent>
                ) : null}
              </Tabs>
            )}
          </div>

          {profilePerson ? (
            <PersonProfileDrawer
              person={profilePerson}
              open={profileOpen}
              onOpenChange={setProfileOpen}
            />
          ) : null}
        </DrawerContent>
      </Drawer>

      <AlertDialog
        open={removeTarget !== null}
        onOpenChange={(next) => {
          if (!next) setRemoveTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove member?</AlertDialogTitle>
            <AlertDialogDescription>
              {removeTarget
                ? `${removeTarget.name} will lose access to ${room.name} but can still see the group and request to join again. Use Block to hide the group from their Groups page.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={cn("bg-destructive text-destructive-foreground hover:bg-destructive/90")}
              onClick={handleRemove}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={blockTarget !== null}
        onOpenChange={(next) => {
          if (!next) setBlockTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Block member?</AlertDialogTitle>
            <AlertDialogDescription>
              {blockTarget
                ? `${blockTarget.name} will lose access to ${room.name} and will no longer see this group on their Groups page. You can unblock them later from the Blocked tab.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={cn("bg-destructive text-destructive-foreground hover:bg-destructive/90")}
              onClick={handleBlock}
            >
              Block
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
