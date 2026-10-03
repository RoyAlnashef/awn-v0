"use client"

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"
import {
  Briefcase,
  ChevronsUpDown,
  ExternalLink,
  LifeBuoy,
  LogOut,
  Settings,
  User,
} from "lucide-react"

import { getCrewProfilePath } from "@/lib/account/handle"
import { signOut } from "@/lib/auth/sign-out"
import { setAvailableForWork } from "@/lib/account/profile-actions"
import {
  setAppearOffline,
  setIncognito,
  touchPresence,
} from "@/lib/presence/actions"
import { iconWithTextDimClass } from "@/lib/icon-styles"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"

export type NavUserData = {
  name: string
  title: string
  email: string
  avatarUrl?: string
  initials: string
  handle?: string
  appearOffline: boolean
  availableForWork: boolean
  incognito: boolean
  online: boolean
}

const links = [
  { label: "My Account", href: "/account", icon: User },
  { label: "My Jobs", href: "/my-jobs", icon: Briefcase },
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Support", href: "/intel", icon: LifeBuoy },
]

function NavUserMenuContent({
  user,
  showProfileHeader,
  showOnlineDot,
  availableForWork,
  appearOffline,
  incognito,
  isPending,
  onAvailableForWorkChange,
  onAppearOfflineChange,
  onIncognitoChange,
  onSignOut,
  onNavigate,
}: {
  user: NavUserData
  showProfileHeader: boolean
  showOnlineDot: boolean
  availableForWork: boolean
  appearOffline: boolean
  incognito: boolean
  isPending: boolean
  onAvailableForWorkChange: (checked: boolean) => void
  onAppearOfflineChange: (checked: boolean) => void
  onIncognitoChange: (checked: boolean) => void
  onSignOut: () => void
  onNavigate: () => void
}) {
  return (
    <>
      {showProfileHeader ? (
        <div className="flex items-center gap-2.5 p-3">
          <Avatar className="size-9">
            {user.avatarUrl ? (
              <AvatarImage src={user.avatarUrl} alt="" />
            ) : null}
            <AvatarFallback>{user.initials}</AvatarFallback>
            <AvatarBadge online={showOnlineDot} className="size-2.5" />
          </Avatar>
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-medium">{user.name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {user.title || user.email}
            </span>
          </div>
        </div>
      ) : null}

      <div
        className={cn(
          "flex items-center justify-between gap-3 px-3 py-2.5",
          showProfileHeader && "border-t",
        )}
      >
        <label
          htmlFor="available-for-work"
          className="text-sm font-medium leading-none"
        >
          Available for work
        </label>
        <Switch
          id="available-for-work"
          checked={availableForWork}
          onCheckedChange={onAvailableForWorkChange}
          aria-label="Available for work"
        />
      </div>

      <div className="flex items-center justify-between gap-3 border-t px-3 py-2.5">
        <label
          htmlFor="appear-offline"
          className="text-sm font-medium leading-none"
        >
          Appear offline
        </label>
        <Switch
          id="appear-offline"
          checked={appearOffline}
          onCheckedChange={onAppearOfflineChange}
          aria-label="Appear offline"
        />
      </div>

      <div className="flex items-center justify-between gap-3 border-t px-3 py-2.5">
        <label
          htmlFor="incognito"
          className="text-sm font-medium leading-none"
          title="Hidden from People and the map; still visible in conversations you're already in."
        >
          Go incognito
        </label>
        <Switch
          id="incognito"
          checked={incognito}
          onCheckedChange={onIncognitoChange}
          aria-label="Go incognito. Hidden from People and the map; still visible in conversations you're already in."
        />
      </div>

      <div className="border-t p-1">
        {links.map((link) => (
          <div key={link.label}>
            <Link
              href={link.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2 rounded-md px-2.5 py-2 text-sm outline-none transition-colors",
                "hover:bg-accent focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
                iconWithTextDimClass,
              )}
            >
              <link.icon className="size-4" />
              {link.label}
            </Link>
            {link.label === "My Account" && user.handle ? (
              <Link
                href={getCrewProfilePath(user.handle)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onNavigate}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2.5 py-2 text-sm outline-none transition-colors",
                  "hover:bg-accent focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
                  iconWithTextDimClass,
                )}
              >
                <ExternalLink className="size-4" />
                My Profile
              </Link>
            ) : null}
          </div>
        ))}
      </div>

      <div className="border-t p-1">
        <button
          type="button"
          onClick={onSignOut}
          disabled={isPending}
          className={cn(
            "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-sm text-destructive outline-none transition-colors hover:bg-destructive/10 focus-visible:bg-destructive/10 focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
            iconWithTextDimClass,
          )}
        >
          <LogOut className="size-4" />
          {isPending ? "Signing out…" : "Log out"}
        </button>
      </div>
    </>
  )
}

export function NavUser({
  user,
  variant = "header",
}: {
  user: NavUserData
  variant?: "header" | "sidebar"
}) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [appearOffline, setAppearOfflineState] = useState(user.appearOffline)
  const [incognito, setIncognitoState] = useState(user.incognito)
  const [availableForWork, setAvailableForWorkState] = useState(
    user.availableForWork,
  )
  const [online, setOnline] = useState(user.online)
  const isMobile = useIsMobile()

  const showOnlineDot = online && !appearOffline
  const isSidebar = variant === "sidebar"

  useEffect(() => {
    setAppearOfflineState(user.appearOffline)
    setIncognitoState(user.incognito)
    setAvailableForWorkState(user.availableForWork)
    setOnline(user.online)
  }, [user.appearOffline, user.incognito, user.availableForWork, user.online])

  useEffect(() => {
    if (!appearOffline) {
      setOnline(true)
    }
  }, [appearOffline])

  function handleClose() {
    setOpen(false)
  }

  function handleSignOut() {
    setOpen(false)
    startTransition(async () => {
      await signOut()
    })
  }

  function handleAvailableForWorkChange(checked: boolean) {
    const previousAvailableForWork = availableForWork

    setAvailableForWorkState(checked)

    void setAvailableForWork(checked).then((result) => {
      if (!result.ok) {
        setAvailableForWorkState(previousAvailableForWork)
      }
    })
  }

  function handleAppearOfflineChange(checked: boolean) {
    const previousAppearOffline = appearOffline
    const previousOnline = online

    setAppearOfflineState(checked)
    if (checked) {
      setOnline(false)
    } else {
      setOnline(true)
      void touchPresence()
    }

    void setAppearOffline(checked).then((result) => {
      if (!result.ok) {
        setAppearOfflineState(previousAppearOffline)
        setOnline(previousOnline)
      }
    })
  }

  function handleIncognitoChange(checked: boolean) {
    const previousIncognito = incognito
    const previousAppearOffline = appearOffline
    const previousOnline = online

    setIncognitoState(checked)
    if (checked) {
      setAppearOfflineState(true)
      setOnline(false)
    }

    void setIncognito(checked).then((result) => {
      if (!result.ok) {
        setIncognitoState(previousIncognito)
        setAppearOfflineState(previousAppearOffline)
        setOnline(previousOnline)
      }
    })
  }

  const triggerClassName = cn(
    "flex items-center gap-2 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
    isSidebar
      ? "w-full rounded-lg px-2 py-2 hover:bg-sidebar-accent focus-visible:ring-sidebar-ring"
      : "rounded-md py-1 pr-2 pl-1 hover:bg-accent",
  )

  const trigger = (
    <>
      <Avatar className="size-8 shrink-0">
        {user.avatarUrl ? (
          <AvatarImage src={user.avatarUrl} alt="" />
        ) : null}
        <AvatarFallback>{user.initials}</AvatarFallback>
        <AvatarBadge online={showOnlineDot} className="size-2.5" />
      </Avatar>
      {isSidebar ? (
        <>
          <div className="flex min-w-0 flex-1 flex-col leading-tight text-left">
            <span className="truncate text-sm font-medium text-sidebar-foreground">
              {user.name}
            </span>
            <span className="truncate text-xs text-sidebar-foreground/60">
              {user.title || user.email}
            </span>
          </div>
          <ChevronsUpDown className="size-4 shrink-0 text-sidebar-foreground/60" />
        </>
      ) : (
        <>
          <span className="hidden text-sm font-medium sm:inline-block">
            {user.name}
          </span>
          <ChevronsUpDown className="hidden size-4 text-muted-foreground sm:inline-block" />
        </>
      )}
    </>
  )

  const menuContentProps = {
    user,
    showOnlineDot,
    availableForWork,
    appearOffline,
    incognito,
    isPending,
    onAvailableForWorkChange: handleAvailableForWorkChange,
    onAppearOfflineChange: handleAppearOfflineChange,
    onIncognitoChange: handleIncognitoChange,
    onSignOut: handleSignOut,
    onNavigate: handleClose,
  }

  if (isMobile) {
    return (
      <Drawer
        open={open}
        onOpenChange={setOpen}
        showSwipeHandle
        swipeDirection="down"
      >
        <DrawerTrigger className={triggerClassName}>{trigger}</DrawerTrigger>
        <DrawerContent className="gap-0 p-0">
          <DrawerTitle className="sr-only">Account menu</DrawerTitle>
          <NavUserMenuContent showProfileHeader {...menuContentProps} />
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={triggerClassName}>{trigger}</PopoverTrigger>
      {open ? (
        <PopoverContent
          align={isSidebar ? "start" : "end"}
          side="bottom"
          className="w-60 gap-0 p-0"
        >
          <NavUserMenuContent
            showProfileHeader={false}
            {...menuContentProps}
          />
        </PopoverContent>
      ) : null}
    </Popover>
  )
}
